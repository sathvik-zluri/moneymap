import express,{ Request, Response } from "express";
import multer from "multer";
import request from "supertest";
import { uploadMiddleware } from "../../src/middleware/uploadMiddleware";


// Create a test Express app
const app = express();

app.post("/api/v1/txns/uploadcsv", uploadMiddleware, async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
       res.status(400).json({ message: "No file uploaded" });
       return;
    }
    res.status(200).json({ message: "File uploaded successfully" });
  });

describe("Upload Middleware", () => {
  it("should upload a file successfully", async () => {
    await request(app)
      .post("/api/v1/txns/uploadcsv")
      .attach("file", Buffer.from("dummy file content"), "testfile.txt")
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe("File uploaded successfully");
      });
  });

  it("should return 400 if no file is uploaded", async () => {
    await request(app)
      .post("/api/v1/txns/uploadcsv")
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe("No file uploaded");
      });
  });

  it("should handle Multer errors gracefully", async () => {
    const mockUpload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 1 }, // Limit file size to 1 byte
    });

    const mockUploadMiddleware = (req: Request, res: Response, next: any) =>
      mockUpload.single("file")(req, res, (err: multer.MulterError | any) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        next();
      });

    const testApp = express();
    testApp.post("/api/v1/txns/uploadcsv", mockUploadMiddleware, (req: Request, res: Response) => {
      res.status(200).json({ message: "File uploaded successfully" });
    });

    await request(testApp)
      .post("/api/v1/txns/uploadcsv")
      .attach("file", Buffer.from("dummy file content"), "testfile.txt")
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toContain("File too large");
      });
  });
});


