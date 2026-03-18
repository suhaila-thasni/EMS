import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("[MAILER] Configuration Error:", error);
  } else {
    console.log("[MAILER] Server is ready to take our messages");
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"Fashion Couture" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    console.log(`[MAILER] Attempting to send email to: ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAILER] Email successfully sent! MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[MAILER] Dispatch Error:", error);
    throw error;
  }
};
