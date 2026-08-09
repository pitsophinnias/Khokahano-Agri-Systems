// ---------------------------------------------------------------------------
// errorHandler.js — global Express error handler
// All errors thrown anywhere in the app land here.
// ---------------------------------------------------------------------------
import { env } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  // Prisma unique constraint violation
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] ?? "field";
    return res.status(409).json({
      error: `An account with this ${field} already exists`,
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }

  // JWT errors (should be caught in middleware but just in case)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large" });
  }

  // Log unexpected errors in dev
  if (env.isDev) {
    console.error("Unhandled error:", err);
  }

  const status  = err.status ?? err.statusCode ?? 500;
  const message = status < 500 ? err.message : "Something went wrong";

  res.status(status).json({ error: message });
}

// Wrap async route handlers so you don't need try/catch in every controller
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}