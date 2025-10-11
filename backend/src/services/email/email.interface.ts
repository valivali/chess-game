export interface EmailServiceInterface {
  sendVerificationEmail(email: string, username: string, verificationToken: string): Promise<boolean>
  sendPasswordResetEmail(email: string, username: string, resetToken: string): Promise<boolean>
}
