export const JwtConfig = {
  jwtSecret: process.env["JWT_SECRET"] || "",
  jwtRefreshSecret: process.env["JWT_REFRESH_SECRET"] || "",
  accessTokenExpiry: process.env["JWT_EXPIRES_IN"] || "",
  refreshTokenExpiry: process.env["JWT_REFRESH_EXPIRES_IN"] || ""
}
