import nodemailer from "nodemailer"
import { EmailServiceInterface } from "./email.interface"

export class EmailService implements EmailServiceInterface {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter(): void {
    const emailConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }

    // Only initialize if SMTP configuration is provided
    if (emailConfig.host && emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig)
    } else {
      console.warn("⚠️  Email service not configured. Set SMTP environment variables to enable email functionality.")
    }
  }

  async sendVerificationEmail(email: string, username: string, verificationToken: string): Promise<boolean> {
    if (!this.transporter) {
      console.log(`📧 [DEV] Email verification for ${username} (${email}): ${verificationToken}`)
      return true // In development, we'll just log the token
    }

    try {
      const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Verify your Chess Game account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Chess Game, ${username}!</h2>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              If you didn't create an account with Chess Game, you can safely ignore this email.
            </p>
          </div>
        `
      })

      return true
    } catch (error) {
      console.error("Failed to send verification email:", error)
      return false
    }
  }

  async sendPasswordResetEmail(email: string, username: string, resetToken: string): Promise<boolean> {
    if (!this.transporter) {
      console.log(`📧 [DEV] Password reset for ${username} (${email}): ${resetToken}`)
      return true // In development, we'll just log the token
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Reset your Chess Game password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${username},</p>
            <p>We received a request to reset your password for your Chess Game account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
            </p>
          </div>
        `
      })

      return true
    } catch (error) {
      console.error("Failed to send password reset email:", error)
      return false
    }
  }

  static build(): EmailService {
    return new EmailService()
  }
}
