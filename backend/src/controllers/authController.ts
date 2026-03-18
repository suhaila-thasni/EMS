import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { query } from "../config/db";
import { generateToken } from "../utils/token";
import { sendEmail } from "../utils/mailer";
import { sendNotification } from "../utils/notificationHelper";

export const register = async (req: Request, res: Response) => {
  const { employeeId, firstName, lastName, email, password, department, shopLocation, profile_img, high_fidelity_maps, auto_sync_gps, role } = req.body;

  if (!employeeId || !firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Check if user exists (case-insensitive email check)
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await query("SELECT * FROM users WHERE email = $1 OR employee_id = $2", [normalizedEmail, employeeId]);
    if (userExists.rows.length > 0) {
      const existingUser = userExists.rows[0];
      const message = existingUser.email === normalizedEmail 
        ? "User with this email already exists" 
        : "User with this employee ID already exists";
      return res.status(400).json({ success: false, message });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // Insert user
    await query(
      "INSERT INTO users (id, employee_id, first_name, last_name, email, password, role, department, shop_location, profile_image, high_fidelity_maps, auto_sync_gps) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
      [id, employeeId, firstName, lastName, normalizedEmail, hashedPassword, role || "Employee", department, shopLocation, profile_img, high_fidelity_maps ?? false, auto_sync_gps ?? false]
    );

    await sendNotification(id, "Account Active", `Welcome to Couture EMS, ${firstName}. Your personnel profile has been initialized.`, "success");

    res.status(201).json({ success: true, message: "Account created successfully" });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const identifier = email ? email.trim() : "";

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "Identification and security key are required" });
  }

  try {
    const normalizedIdentifier = identifier.toLowerCase();
    // Check for user by email OR employee_id (case-insensitive)
    const result = await query(
      "SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(employee_id) = $1 OR employee_id = $2", 
      [normalizedIdentifier, identifier]
    );
    const user = result.rows[0];

    if (!user) {
      console.log(`[AUTH] Login failed: No user found for identifier "${identifier}"`);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[AUTH] Login failed: Password mismatch for user "${identifier}"`);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    console.log(`[AUTH] Login successful: ${user.email} (${user.role})`);
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    await sendNotification(user.id, "Session Authorized", `New login protocol verified from a mobile terminal at ${new Date().toLocaleTimeString()}.`, "info");

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        department: user.department,
        profile_img: user.profile_image
      }
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const normalizedEmail = email ? email.toLowerCase().trim() : "";

  try {
    const result = await query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    const user = result.rows[0];

    if (!user) {
      console.log(`[AUTH] Forgot Password failed: User not found for email "${normalizedEmail}"`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60000); // 10 mins

    await query("UPDATE users SET otp = $1, otp_expires = $2 WHERE email = $3", [otp, expires, normalizedEmail]);

    await sendNotification(user.id, "Security Protocol Inbound", "A password reset request was initiated. Verify the security key sent to your email.", "warning");

    await sendEmail(
      normalizedEmail,
      "Security Key Reset Protocol",
      `<h1>Password Reset Request</h1>
       <p>Authorize your password reset with the following OTP:</p>
       <h2 style="letter-spacing: 5px; color: #4338ca;">${otp}</h2>
       <p>This code expires in 10 minutes.</p>`
    );

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const normalizedEmail = email ? email.toLowerCase().trim() : "";

  try {
    const result = await query("SELECT * FROM users WHERE email = $1 AND otp = $2", [normalizedEmail, otp]);
    const user = result.rows[0];

    if (!user) {
      console.log(`[AUTH] OTP Verification failed for "${normalizedEmail}": Invalid OTP`);
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    res.json({ success: true, message: "OTP verified" });
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = email ? email.toLowerCase().trim() : "";

  try {
    const result = await query("SELECT * FROM users WHERE email = $1 AND otp = $2", [normalizedEmail, otp]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid OTP or session" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password = $1, otp = NULL, otp_expires = NULL WHERE email = $2", [hashedPassword, normalizedEmail]);

    res.json({ success: true, message: "Password reset successful" });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
