import { connectDB } from "../data/database";
import { Transctions } from "../entities/Transctions";
import Papa from "papaparse";
import { createUniqueKey, parseDate } from "../utils/utilityFunctions";
import { TransactionRow, UploadResult } from "../types/types";

export const uploadTransactionService = async (
  fileBuffer: Buffer
): Promise<UploadResult> => {
  const orm = await connectDB();
  if (!orm) throw new Error("Database connection failed");
  const em = orm.em.fork();

  let fileContent = fileBuffer.toString("utf-8");
  if (fileContent.charCodeAt(0) === 0xfeff) {
    fileContent = fileContent.slice(1); // Remove BOM
  }

  const transactions: Transctions[] = [];
  const duplicates: TransactionRow[] = [];
  const schemaErrors: any[] = [];
  const seenTransactions = new Set<string>();

  // Parse CSV content
  return new Promise((resolve, reject) => {
    Papa.parse<TransactionRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // Fetch all existing transactions from DB in bulk
        const dbRecords = await em.find(
          Transctions,
          {},
          { fields: ["Date", "Description"] }
        );

        // Create a set of database-level unique keys
        const dbDuplicates = new Set(
          dbRecords.map((record) =>
            createUniqueKey(record.Date.toISOString(), record.Description)
          )
        );

        for (const row of results.data) {
          const { Date: rawDate, Description, Amount, Currency } = row;

          const dateObject = parseDate(rawDate);
          if (!dateObject) {
            schemaErrors.push({ row, message: "Invalid date format" });
            continue;
          }

          const parsedAmount = parseFloat(Amount);
          if (!Description || isNaN(parsedAmount) || !Currency) {
            schemaErrors.push({
              row,
              message:
                "Invalid schema: Missing required fields or invalid amount",
            });
            continue;
          }

          const uniqueKey = createUniqueKey(
            dateObject.toISOString(),
            Description
          );
          if (seenTransactions.has(uniqueKey) || dbDuplicates.has(uniqueKey)) {
            duplicates.push(row);
            continue;
          }
          seenTransactions.add(uniqueKey);

          const transaction = new Transctions();
          transaction.Date = dateObject;
          transaction.Description = Description;
          transaction.Amount = parsedAmount;
          transaction.Currency = Currency;

          transactions.push(transaction);
        }

        if (transactions.length > 0) {
          await em.persist(transactions).flush(); // Bulk save
        }

        resolve({
          message:
            transactions.length > 0
              ? "File processed successfully"
              : "Empty file",
          transactionsSaved: transactions.length,
          duplicates,
          schemaErrors,
        });
      },
      error: (error: Error) => {
        console.log("Parsing error occurred:", error);
        reject(new Error(`Failed to parse file: ${error.message}`));
      },
    });
  });
};
