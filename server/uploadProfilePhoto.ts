import { Request, Response } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { randomBytes } from "crypto";

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export const uploadProfilePhotoMiddleware = upload.single("file");

export async function uploadProfilePhotoHandler(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate unique filename
    const randomSuffix = randomBytes(8).toString("hex");
    const ext = req.file.originalname.split(".").pop() || "jpg";
    const filename = `profile-photos/${Date.now()}-${randomSuffix}.${ext}`;

    // Upload to S3
    const { url } = await storagePut(
      filename,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ url });
  } catch (error) {
    console.error("Profile photo upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
}
