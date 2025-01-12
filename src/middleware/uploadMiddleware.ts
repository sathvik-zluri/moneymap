import multer, { MulterError } from "multer";
import { Request, Response, NextFunction } from "express";

// Configure Multer storage to use memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to handle file upload
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  upload.single("file")(req, res, (err: MulterError | any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};