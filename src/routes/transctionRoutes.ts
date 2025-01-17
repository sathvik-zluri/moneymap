import { Router } from "express";
import {
  getTransctions,
  addTransctions,
  deleteTransaction,
  updateTransction,
  uploadTransactions,
} from "../controllers/transactionController";
import { validateTransactionInput } from "../middleware/validateTransactionInput";
import { uploadMiddleware } from "../middleware/uploadMiddleware";
import { validateFileUpload } from "../middleware/validateFileUpload";
import { getTransactionsValidator } from "../middleware/getTransctionsValidator";
import { validateTransactionId } from "../middleware/validateTransactionId";
import { validateTransactionExistence } from "../middleware/validateTransactionExistence";

const router = Router();

//Fetching transctions with pagination & sorting
router.get("/list", getTransactionsValidator, getTransctions);

//Uploading transctions throught csv
router.post(
  "/uploadcsv",
  uploadMiddleware,
  validateFileUpload,
  uploadTransactions
);

//Adding transctions with feature finding duplicalcy
router.post("/add", validateTransactionInput, addTransctions);

//Update transctions
router.put(
  "/update/:id",
  validateTransactionId,
  validateTransactionInput,
  validateTransactionExistence,
  updateTransction
);

// Delete Transaction
router.delete(
  "/delete/:id",
  validateTransactionId,
  validateTransactionExistence,
  deleteTransaction
);

export default router;
