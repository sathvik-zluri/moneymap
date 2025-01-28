import { Transctions } from "../entities/Transctions";
import Papa from "papaparse";
import { parseDate } from "../utils/utilityFunctions";
import { TransactionRow, UploadResult } from "../types/types";
import { getEntityManager } from "../data/getEntityManger";
import { convertCurrency } from "../utils/exchangeRate";
import { specialChars } from "../constants/specialChar";

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
    // Trim the description and currency replace multiple spaces with a single space
    const trimmedDescription = Description.trim().replace(/\s+/g, " ");
    const trimmedCurrency = Currency.trim();

    // Check if description contains any special characters
    const invalidChar = specialChars.find((char) =>
      trimmedDescription.includes(char)
    );
    if (invalidChar) {
      schemaErrors.push({
        row,
        message: `Description contains an invalid special character: '${invalidChar}'`,
      });
      continue;
    }

    // If description is empty after trimming, handle as invalid
    if (!trimmedDescription) {
      schemaErrors.push({
        row,
        message: "Description cannot be empty after trimming",
      });
      continue;
    }

    if (!trimmedCurrency) {
      schemaErrors.push({
        row,
        message: "Currency cannot be empty",
      });
      continue;
    }

    // Update the row with the cleaned description
    row.Description = trimmedDescription;
    row.Currency = trimmedCurrency;

    const parsedAmount = parseFloat(Amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
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
    transaction.Description = row.Description;
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

  // Step 3: Fetch currency conversion for all transactions in batch
  if (finalValidTransactions.length > 0) {
    // Create a Map for unique conversion requests (date + currency + amount)
    const conversionRequests = finalValidTransactions.map((transaction) => ({
      date: transaction.Date.toISOString().slice(0, 10),
      currency: transaction.Currency,
      amount: transaction.Amount,
    }));

    // Fetch all conversion rates for the unique requests using Promise.all
    const conversionResults = await Promise.all(
      conversionRequests.map((request) =>
        convertCurrency(request.date, request.currency, request.amount)
      )
    );

    // Store the results in a Map for efficient lookup by key (date + currency + amount)
    const conversionMap = new Map(
      conversionResults.map((result, index) => {
        const request = conversionRequests[index];
        return [
          `${request.date}-${request.currency}-${request.amount}`,
          result.amountInr,
        ];
      })
    );

    // Assign the conversion rates to the corresponding transactions
    finalValidTransactions.forEach((transaction) => {
      const key = `${transaction.Date.toISOString().slice(0, 10)}-${
        transaction.Currency
      }-${transaction.Amount}`;
      const amountInr = conversionMap.get(key);
      if (amountInr !== undefined) {
        transaction.AmountINR = amountInr;
      }
    });

    // Step 4: Persist valid transactions to the database
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
