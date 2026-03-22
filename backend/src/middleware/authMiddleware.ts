import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  const roleLower = role?.toLowerCase();
  console.log(`[AUTH] authorizeAdmin check — user role: "${role}" (normalized: "${roleLower}")`);
  if (roleLower !== "admin" && roleLower !== "system admin") {
    console.warn(`[AUTH] Admin access denied — role "${role}" is not admin or system admin`);
    return res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
  }
  next();
};
