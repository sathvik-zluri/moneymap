import { Request } from "express";

// types required for getTransactionsService.ts
export interface GetTransactionsParams {
  page: number;
  limit: number;
  sort: "asc" | "desc";
  frequency?: string;
  startDate?: Date;
  endDate?: Date;
}

// types required for addTransactionsService.ts
export interface AddTransactionParams {
  rawDate: string; // Date as a string (ISO format)
  description: string;
  amount: number;
  currency: string;
}

//types required for updateTransactionService.ts
export interface UpdateTransactionParams {
  id: number;
  rawDate?: string; // Optional: date field
  description?: string; // Optional: description field
  amount?: number; // Optional: amount field
  currency?: string; // Optional: currency field
}

//types required for validateFileUpload.ts
export interface FileRequest extends Request {
  file?: Express.Multer.File;
}

// types required for uploadTransactionService.ts
export interface TransactionRow {
  Date: string; // Raw date from the CSV (to be converted to Date)
  Description: string; // Matches the entity's "descripition" field
  Amount: string; // Raw amount from the CSV (to be converted to a number)
  Currency: string; // Matches the entity's "currency" field
  AmountINR?: string; // Optional: amount in INR (to be calculated)
}

export interface UploadResult {
  message: string;
  transactionsSaved: number;
  duplicates: TransactionRow[];
  schemaErrors: any[];
}
