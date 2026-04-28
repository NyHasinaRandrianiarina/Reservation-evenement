import type { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const EVENTS_UPLOAD_DIR = path.join(process.cwd(), "uploads", "events");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(EVENTS_UPLOAD_DIR, { recursive: true });
    cb(null, EVENTS_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Format d'image non supporté"));
    return;
  }
  cb(null, true);
}

export const eventCoverUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
