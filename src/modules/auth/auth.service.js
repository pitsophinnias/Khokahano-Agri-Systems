// ---------------------------------------------------------------------------
// auth.service.js — business logic for authentication
// ---------------------------------------------------------------------------
import bcrypt  from "bcryptjs";
import jwt     from "jsonwebtoken";
import prisma  from "../../config/db.js";
import { env } from "../../config/env.js";

function generateToken(userId) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function safeUser(user) {
  // Never send the password hash to the client
  const { passwordHash, ...safe } = user;
  return safe;
}

// ── REGISTER ─────────────────────────────────────────────────
export async function registerFarmer(data) {
  const { email, phone, password, firstName, lastName, district, village, farmName } = data;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email, phone, passwordHash,
      role: "FARMER",
      firstName, lastName, district, village,
      farmer: {
        create: {
          farmName: farmName ?? `${firstName}'s Farm`,
        },
      },
    },
    include: { farmer: true },
  });

  const token = generateToken(user.id);
  return { token, user: safeUser(user) };
}

export async function registerBuyer(data) {
  const { email, phone, password, firstName, lastName, district, village } = data;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email, phone, passwordHash,
      role: "BUYER",
      firstName, lastName, district, village,
      buyer: { create: {} },
    },
    include: { buyer: true },
  });

  const token = generateToken(user.id);
  return { token, user: safeUser(user) };
}

// ── LOGIN ─────────────────────────────────────────────────────
export async function login(identifier, password) {
  // identifier can be email or phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
      ],
    },
    include: {
      farmer: { select: { id: true, isVerified: true, subscription: true, farmName: true } },
      buyer:  { select: { id: true } },
      admin:  { select: { id: true } },
    },
  });

  if (!user) {
    const err = new Error("Invalid email/phone or password");
    err.status = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("This account has been deactivated");
    err.status = 403;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error("Invalid email/phone or password");
    err.status = 401;
    throw err;
  }

  const token = generateToken(user.id);
  return { token, user: safeUser(user) };
}

// ── GET CURRENT USER ─────────────────────────────────────────
export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      farmer: { select: { id: true, isVerified: true, subscription: true, farmName: true, profilePhotoUrl: true } },
      buyer:  { select: { id: true } },
      admin:  { select: { id: true } },
    },
  });
  return safeUser(user);
}

// ── CHANGE PASSWORD ───────────────────────────────────────────
export async function changePassword(userId, oldPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) {
    const err = new Error("Current password is incorrect");
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { message: "Password updated successfully" };
}