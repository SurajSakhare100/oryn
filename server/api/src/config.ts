import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  // Server
  PORT: parseInt(process.env.PORT_API || process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:3001/api/auth/google/callback",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "changeme_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Frontend
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  // CORS
  ALLOWED_CORS_ORIGINS: (
    process.env.ALLOWED_CORS_ORIGINS || "http://localhost:3000"
  )
    .split(",")
    .map((o) => o.trim()),

  // FastAPI AI Service
  AI_SERVICE_URL:
    process.env.AI_SERVICE_URL || "http://localhost:8000",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",
};
