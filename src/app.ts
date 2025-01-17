import express, { Request, Response } from "express";
import { config } from "dotenv";
import transctionRouter from "./routes/transctionRoutes";
import internalRouter from "./routes/internalRoutes";

// Load .env variables in a secure and accessible way
config();

export const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Using routes
app.use("/api/v1/txns", transctionRouter);
app.use("/api/v1/internal", internalRouter);

//Entry page
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the transaction API");
});
