import express, { Request, Response } from "express";
import { config } from "dotenv";
import transctionRouter from './routes/transctionRoutes'

// Load .env variables in a secure and accessible way
config();

export const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Using routes
app.use("/api/v1/txns", transctionRouter);





