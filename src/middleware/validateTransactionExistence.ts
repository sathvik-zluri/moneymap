import { Request, Response, NextFunction } from "express";
import { getTransactionById } from "../services/getTransactionById";
import { getEntityManager } from "../data/getEntityManger";

export const validateTransactionExistence = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const em = await getEntityManager();
  try {
    const existingTransaction = await getTransactionById(parseInt(id), em);

    if (!existingTransaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    if (existingTransaction.isDeleted) {
      res.status(400).json({ error: "Transaction already deleted" });
      return;
    }

    // Attach the existing transaction to the request for later use
    req.body.transaction = existingTransaction;
    next(); // Continue to the next middleware or controller
  } catch (error) {
    next(error);
  }
};
