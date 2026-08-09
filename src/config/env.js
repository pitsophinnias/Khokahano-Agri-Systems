// ---------------------------------------------------------------------------
// env.js — validates required environment variables at startup
// The server refuses to start if any critical variable is missing.
// ---------------------------------------------------------------------------
import dotenv from "dotenv";
dotenv.config();

const required = ["DATABASE_URL", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error(`   Check your .env file against .env.example`);
    process.exit(1);
  }
}

export const env = {
  DATABASE_URL:   process.env.DATABASE_URL,
  JWT_SECRET:     process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN  ?? "7d",
  PORT:           parseInt(process.env.PORT   ?? "4000"),
  NODE_ENV:       process.env.NODE_ENV         ?? "development",
  FRONTEND_URL:   process.env.FRONTEND_URL     ?? "http://localhost:3000",
  UPLOAD_DIR:     process.env.UPLOAD_DIR       ?? "uploads",
  MAX_FILE_SIZE:  parseInt(process.env.MAX_FILE_SIZE_MB ?? "5") * 1024 * 1024,
  isDev:          (process.env.NODE_ENV ?? "development") === "development",
};