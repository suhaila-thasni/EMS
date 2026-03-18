import { Request, Response } from "express";
import { query } from "../config/db";
import { v4 as uuidv4 } from "uuid";

export const getMessages = async (req: Request, res: Response) => {
    try {
        const result = await query("SELECT * FROM messages ORDER BY created_at DESC");
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const createMessage = async (req: Request, res: Response) => {
    const { title, content, priority, category, author } = req.body;
    try {
        const id = uuidv4();
        await query(
            "INSERT INTO messages (id, title, content, priority, category, author) VALUES ($1, $2, $3, $4, $5, $6)",
            [id, title, content, priority || 'Normal', category || 'General', author || 'System Admin']
        );
        res.status(201).json({ success: true, message: "Message broadcasted successfully" });
    } catch (error) {
        console.error("Create Message Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateMessage = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, priority, category } = req.body;
    try {
        await query(
            "UPDATE messages SET title = COALESCE($1, title), content = COALESCE($2, content), priority = COALESCE($3, priority), category = COALESCE($4, category) WHERE id = $5",
            [title, content, priority, category, id]
        );
        res.json({ success: true, message: "Message updated successfully" });
    } catch (error) {
        console.error("Update Message Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteMessage = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query("DELETE FROM messages WHERE id = $1", [id]);
        res.json({ success: true, message: "Message purged from system" });
    } catch (error) {
        console.error("Delete Message Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
