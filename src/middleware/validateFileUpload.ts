import { Response, NextFunction } from "express";
import { FileRequest } from "../types/types";

export const validateFileUpload = (
  req: FileRequest,
  res: Response,
  next: NextFunction
) => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  // Validate file type (CSV)
  if (file.mimetype !== "text/csv") {
    res
      .status(400)
      .json({ message: "Invalid file type. Only CSV files are allowed." });
    return;
  }

  // Validate file size (1 MB)
  const MAX_SIZE_MB = 1;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    res
      .status(400)
      .json({ message: `File size exceeds ${MAX_SIZE_MB} MB limit.` });
    return;
  }

  next();
};
