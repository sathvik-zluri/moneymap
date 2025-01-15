import { Response } from "express";
import {
  validateFileUpload,
} from "../../src/middleware/validateFileUpload";
import { FileRequest } from "../../src/types/types";

// Mock the necessary objects
describe("validateFileUpload Middleware", () => {
  let req: Partial<FileRequest>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should return 400 if no file is uploaded", () => {
    req.file = undefined;

    validateFileUpload(req as FileRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "No file uploaded" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if the file is not a CSV", () => {
    req.file = {
      mimetype: "application/pdf", // Invalid file type
      size: 50000,
    } as Express.Multer.File;

    validateFileUpload(req as FileRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid file type. Only CSV files are allowed.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if the file size exceeds 1 MB", () => {
    req.file = {
      mimetype: "text/csv",
      size: 2 * 1024 * 1024, // 2 MB
    } as Express.Multer.File;

    validateFileUpload(req as FileRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "File size exceeds 1 MB limit.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if the file is valid", () => {
    req.file = {
      mimetype: "text/csv", // Valid file type
      size: 50000, // Valid size
    } as Express.Multer.File;

    validateFileUpload(req as FileRequest, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
