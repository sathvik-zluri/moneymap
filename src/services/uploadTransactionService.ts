import { Transctions } from "../entities/Transctions";
import Papa from "papaparse";
import { parseDate } from "../utils/utilityFunctions";
import { TransactionRow, UploadResult } from "../types/types";
import { getEntityManager } from "../data/getEntityManger";
import { date } from "joi";
import { convertCurrency } from "../utils/exchangeRate";

export const uploadTransactionService = async (
  fileBuffer: Buffer
): Promise<UploadResult> => {
  //Getting EntityManager from the connection
  const em = await getEntityManager();

  let fileContent = fileBuffer.toString("utf-8");
  if (fileContent.charCodeAt(0) === 0xfeff) {
    fileContent = fileContent.slice(1); // Remove BOM
  }

  const transactions: Transctions[] = [];
  const duplicates: TransactionRow[] = [];
  const schemaErrors: any[] = [];
  const seenTransactions = new Set<string>();

  // Parse CSV content and validate data
  const rows = await new Promise<TransactionRow[]>((resolve, reject) => {
    Papa.parse<TransactionRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error: Error) =>
        reject(new Error(`Failed to parse file: ${error.message}`)),
    });
  });

  // Step 1: Process CSV data and check for file-level duplicates
  for (const row of rows) {
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
        message: "Invalid schema: Missing required fields or invalid amount",
      });
      continue;
    }

    // Track transactions for file-level duplicate checking
    const uniqueKey = `${dateObject.toISOString()}-${Description}`;
    if (seenTransactions.has(uniqueKey)) {
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

  // Step 2: Check for database-level duplicates in batches
  const dbDuplicates = await em.find(Transctions, {
    $or: transactions.map((t) => ({
      Date: t.Date,
      Description: t.Description,
      isDeleted: false,
    })),
  });

  const dbDuplicatesSet = new Set(
    dbDuplicates.map((t) => `${t.Date.toISOString()}-${t.Description}`)
  );

  const finalValidTransactions = transactions.filter(
    (t) => !dbDuplicatesSet.has(`${t.Date.toISOString()}-${t.Description}`)
  );

  dbDuplicates.forEach((t) => {
    duplicates.push({
      Date: t.Date.toISOString(),
      Description: t.Description,
      Amount: t.Amount.toString(),
      Currency: t.Currency,
      AmountINR: t.AmountINR.toString(),
    });
  });

  // Step 3: Flush valid transactions to the database
  if (finalValidTransactions.length > 0) {
    for (const transaction of finalValidTransactions) {
      const { amountInr } = await convertCurrency(
        transaction.Date.toISOString().slice(0, 10),
        transaction.Currency,
        transaction.Amount
      );
      transaction.AmountINR = amountInr;
    }
    await em.persist(finalValidTransactions).flush();
  }

  return {
    message:
      finalValidTransactions.length > 0
        ? "File processed successfully"
        : "Empty file",
    transactionsSaved: finalValidTransactions.length,
    duplicates,
    schemaErrors,
  };
};
