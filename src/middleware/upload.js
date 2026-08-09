// ---------------------------------------------------------------------------
// upload.js — Multer file upload middleware
// Used for product image uploads by farmers.
// ---------------------------------------------------------------------------
import multer from "multer";
import path   from "path";
import { v4 as uuid } from "uuid";
import { env } from "../config/env.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WebP images are allowed"));
  }
};

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE },
}).array("images", 5); // max 5 images per product