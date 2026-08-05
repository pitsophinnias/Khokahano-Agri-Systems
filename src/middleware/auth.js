// ---------------------------------------------------------------------------
// auth.js — JWT middleware
// Verifies the token on protected routes and attaches the user to req.user
// ---------------------------------------------------------------------------
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../config/db.js";

// Verify token and attach user to request
export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user    = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, email: true, phone: true,
        role: true, firstName: true, lastName: true,
        district: true, isActive: true,
        farmer: { select: { id: true, isVerified: true, subscription: true } },
        buyer:  { select: { id: true } },
        admin:  { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Account not found or deactivated" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Role guards — use after authenticate
export function requireFarmer(req, res, next) {
  if (req.user.role !== "FARMER") {
    return res.status(403).json({ error: "Farmer access required" });
  }
  next();
}

export function requireBuyer(req, res, next) {
  if (req.user.role !== "BUYER") {
    return res.status(403).json({ error: "Buyer access required" });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function requireFarmerOrAdmin(req, res, next) {
  if (!["FARMER", "ADMIN"].includes(req.user.role)) {
    return res.status(403).json({ error: "Farmer or admin access required" });
  }
  next();
}