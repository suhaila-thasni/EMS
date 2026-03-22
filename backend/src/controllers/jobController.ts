import { Request, Response } from "express";
import { query } from "../config/db";
import { v4 as uuidv4 } from "uuid";

export const getJobs = async (req: Request, res: Response) => {
    try {
        const result = await query("SELECT * FROM jobs ORDER BY created_at DESC");
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get Jobs Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const createJob = async (req: Request, res: Response) => {
    const { title, description, department, location, salary, type } = req.body;
    try {
        const id = uuidv4();
        await query(
            "INSERT INTO jobs (id, title, description, department, location, salary, type) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [id, title, description, department, location, salary, type || 'Full-time']
        );
        res.status(201).json({ success: true, message: "Job opportunity registered" });
    } catch (error) {
        console.error("Create Job Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, department, location, salary, type } = req.body;
    try {
        await query(
            "UPDATE jobs SET title = COALESCE($1, title), description = COALESCE($2, description), department = COALESCE($3, department), location = COALESCE($4, location), salary = COALESCE($5, salary), type = COALESCE($6, type) WHERE id = $7",
            [title, description, department, location, salary, type, id]
        );
        res.json({ success: true, message: "Job listing updated" });
    } catch (error) {
        console.error("Update Job Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query("DELETE FROM jobs WHERE id = $1", [id]);
        res.json({ success: true, message: "Job listing removed" });
    } catch (error) {
        console.error("Delete Job Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const applyToJob = async (req: Request, res: Response) => {
    const { jobId, motivation } = req.body;
    const userId = (req as any).user.id;
    try {
        const id = uuidv4();
        await query(
            "INSERT INTO job_applications (id, job_id, user_id, motivation) VALUES ($1, $2, $3, $4)",
            [id, jobId, userId, motivation]
        );
        res.status(201).json({ success: true, message: "Application submitted" });
    } catch (error) {
        console.error("Apply Job Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const submitReferral = async (req: Request, res: Response) => {
    const { candidateName, candidateEmail, targetDepartment } = req.body;
    const userId = (req as any).user.id;
    try {
        const id = uuidv4();
        await query(
            "INSERT INTO job_referrals (id, referred_by, candidate_name, candidate_email, target_department) VALUES ($1, $2, $3, $4, $5)",
            [id, userId, candidateName, candidateEmail, targetDepartment]
        );
        res.status(201).json({ success: true, message: "Referral recorded" });
    } catch (error) {
        console.error("Referral Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getApplications = async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT ja.*, j.title as job_title, u.first_name, u.last_name, u.email 
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            JOIN users u ON ja.user_id = u.id
            ORDER BY ja.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get Applications Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getReferrals = async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT jr.*, u.first_name as referrer_first, u.last_name as referrer_last 
            FROM job_referrals jr
            JOIN users u ON jr.referred_by = u.id
            ORDER BY jr.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get Referrals Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
