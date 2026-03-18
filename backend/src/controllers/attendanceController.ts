import { Request, Response } from "express";
import { query } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { sendNotification } from "../utils/notificationHelper";
import fs from "fs";
import path from "path";

export const markAttendance = async (req: Request, res: Response) => {
  const { user_id, type, location, image } = req.body;

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Double check for existing record today (Safety check)
    const existingResult = await query(
      "SELECT id FROM attendance WHERE user_id = $1 AND type = $2 AND DATE(timestamp) = $3",
      [user_id, type, today]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `You have already recorded a ${type} for today.` 
      });
    }

    const timestamp = new Date();
    const id = uuidv4();
    
    // 2. Handle Image Storage
    let selfie_url = image;
    if (image && image.startsWith("data:image")) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `attendance_${user_id}_${Date.now()}.jpg`;
      const uploadPath = path.join(__dirname, "../../uploads/attendance", fileName);
      
      fs.writeFileSync(uploadPath, base64Data, 'base64');
      selfie_url = `/uploads/attendance/${fileName}`;
    }

    // Determine status (Late vs Present)
    const hours = timestamp.getHours();
    const minutes = timestamp.getMinutes();
    let status = "verified";
    
    if (type === "check-in") {
      // Shift Start: 09:30
      if (hours > 9 || (hours === 9 && minutes > 30)) {
        status = "Late";
      } else {
        status = "Present";
      }
    } else if (type === "check-out") {
      // Shift End: 21:30 (9:30 PM)
      if (hours < 21 || (hours === 21 && minutes < 30)) {
        status = "Early Departure";
      } else {
        status = "Shift Completed";
      }
    }

    await query(
      "INSERT INTO attendance (id, user_id, type, timestamp, latitude, longitude, selfie_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [id, user_id, type, timestamp, location.lat, location.lng, selfie_url, status]
    );

    // Live Notification
    await sendNotification(
      user_id,
      `${type.toUpperCase()} VERIFIED`,
      `Your ${type} has been authorized with status: ${status}. Dynamic range: ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`,
      status === "Late" ? "warning" : "success"
    );

    res.status(201).json({ 
      success: true, 
      status,
      message: `${type} successful` 
    });
  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAttendanceHistory = async (req: Request, res: Response) => {
  const { user_id } = req.query;

  try {
    const result = await query(
      `SELECT 
        a.*, 
        u.first_name || ' ' || u.last_name as name, 
        u.department 
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1 
      ORDER BY a.timestamp DESC`,
      [user_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getDailyStatus = async (req: Request, res: Response) => {
  const { user_id } = req.query;
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await query(
      "SELECT type FROM attendance WHERE user_id = $1 AND DATE(timestamp) = $2",
      [user_id, today]
    );
    
    const hasCheckedIn = result.rows.some(r => r.type === "check-in");
    const hasCheckedOut = result.rows.some(r => r.type === "check-out");

    res.json({ success: true, hasCheckedIn, hasCheckedOut });
  } catch (error) {
    console.error("Status Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        a.id, a.user_id, a.type, a.timestamp, a.latitude, a.longitude, a.status, a.selfie_url,
        u.first_name || ' ' || u.last_name as name, u.department
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT 100
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("All Attendance Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPersonalStats = async (req: Request, res: Response) => {
  const { user_id } = req.query;
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Present') as present,
        COUNT(*) FILTER (WHERE status = 'Late') as late,
        COUNT(*) FILTER (WHERE type = 'check-in') as total_days
      FROM attendance 
      WHERE user_id = $1
    `, [user_id]);

    const stats = statsResult.rows[0];
    res.json({
      success: true,
      stats: {
        present: stats.present || 0,
        late: stats.late || 0,
        absent: 0,
        avgShift: "9.2h"
      }
    });
  } catch (error) {
    console.error("Personal Stats Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const exportAllAttendance = async (req: any, res: Response) => {
  const { user_id } = req.query;
  const requesterId = req.user?.id;
  const requesterRole = req.user?.role;

  // Security check: If not admin, can only export own data
  if (requesterRole !== 'Admin' && user_id && user_id !== requesterId) {
    return res.status(403).json({ success: false, message: "Unauthorized to export this user's data" });
  }

  // If not admin and no user_id provided, default to self
  const targetId = requesterRole === 'Admin' ? user_id : (user_id || requesterId);

  try {
    let queryStr = `
      SELECT 
        a.id, 
        u.first_name || ' ' || u.last_name as user_name,
        u.department,
        a.type,
        a.timestamp,
        a.status,
        a.latitude,
        a.longitude
      FROM attendance as a
      JOIN users as u ON a.user_id = u.id
    `;
    
    let queryParams: any[] = [];
    if (targetId) {
      queryStr += " WHERE a.user_id = $1";
      queryParams.push(targetId);
    }
    
    queryStr += " ORDER BY a.timestamp DESC";

    const result = await query(queryStr, queryParams);
    
    const records = result.rows;
    if (records.length === 0) {
      return res.status(404).json({ success: false, message: "No attendance records found to export" });
    }

    const csvHeaders = "ID,User Name,Department,Type,Timestamp,Status,Location\n";
    const csvRows = records.map(record => {
      const location = record.latitude && record.longitude ? `"${record.latitude}, ${record.longitude}"` : "N/A";
      const timestamp = new Date(record.timestamp).toISOString();
      return `${record.id},"${record.user_name}","${record.department}","${record.type}","${timestamp}","${record.status}",${location}`;
    }).join("\n");

    const csvString = csvHeaders + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=global_attendance_feed.csv");
    res.send(csvString);
  } catch (error) {
    console.error("Export Attendance Error:", error);
    res.status(500).json({ success: false, message: "Failed to export attendance" });
  }
};

export const updateAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, type, timestamp } = req.body;

  try {
    await query(
      "UPDATE attendance SET status = $1, type = $2, timestamp = $3 WHERE id = $4",
      [status, type, timestamp, id]
    );
    res.json({ success: true, message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Update Attendance Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await query("DELETE FROM attendance WHERE id = $1", [id]);
    res.json({ success: true, message: "Attendance deleted successfully" });
  } catch (error) {
    console.error("Delete Attendance Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createAttendance = async (req: Request, res: Response) => {
  const { user_id, type, timestamp, status, latitude, longitude } = req.body;

  try {
    const id = uuidv4();
    await query(
      "INSERT INTO attendance (id, user_id, type, timestamp, latitude, longitude, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [id, user_id, type, timestamp || new Date(), latitude || 0, longitude || 0, status || 'Present']
    );

    res.status(201).json({ success: true, message: "Attendance record created" });
  } catch (error) {
    console.error("Create Attendance Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
