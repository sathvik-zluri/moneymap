import { Request, Response, NextFunction } from "express";
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "../../mikro-orm.config";
import { Transctions } from "../entities/Transctions";

export const validateTransactionInput = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { date, Description, Amount, Currency } = req.body;

  try {
    // Check for required fields
    if (!date || !Description || !Amount || !Currency) {
      res
        .status(400)
        .json({ message: "date, Description, Amount, and Currency are required" });
      return;
    }

    // Validate field types
    if (isNaN(Date.parse(date))) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    if (typeof Description !== "string" || Description.trim() === "") {
      res.status(400).json({ message: "Description must be a non-empty string" });
      return;
    }

    if (typeof Amount !== "number" || Amount <= 0 || !Number.isFinite(Amount)) {
      res.status(400).json({ message: "Amount must be a positive number" });
      return;
    }

    if (typeof Currency !== "string" || Currency.trim() === "") {
      res.status(400).json({ message: "Currency must be a non-empty string" });
      return;
    }

    // Initialize database ORM and Entity Manager
    const orm = await MikroORM.init(mikroOrmConfig);
    const em = orm.em.fork();

    // Check for duplicate transactions (date and description match)
    const existingTransaction = await em.findOne(Transctions, {
      Date: new Date(date),
      Description,
      isDeleted: false, // Ensure we don't count soft-deleted records
    });

    if (existingTransaction) {
      res
        .status(409)
        .json({ message: "A transaction with the same date and description already exists" });
      return;
    }

    next(); // Validation passed, proceed to the next middleware or controller
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ message: "Server error during validation", error });
    return;
  }
};
