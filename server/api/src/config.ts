import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  // Server
  PORT: parseInt(process.env.PORT_API || process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // FastAPI AI Service
  AI_SERVICE_URL:
    process.env.AI_SERVICE_URL || "http://localhost:8000",
  AI_SERVICE_TOKEN: process.env.AI_SERVICE_TOKEN || "",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",
};

if (!config.JWT_SECRET) {
  throw new Error("JWT_SECRET is required. Set it in the API service environment.");
}
