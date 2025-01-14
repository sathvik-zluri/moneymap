import { connectDB } from "../data/database";
import { Transctions } from "../entities/Transctions";
import Papa from "papaparse";
import { isValid } from "date-fns";

interface TransactionRow {
  Date: string; // Raw date from the CSV (to be converted to Date)
  Description: string; // Matches the entity's "descripition" field
  Amount: string; // Raw amount from the CSV (to be converted to a number)
  Currency: string; // Matches the entity's "currency" field
}

interface UploadResult {
  message: string;
  transactionsSaved: number;
  duplicates: TransactionRow[];
  schemaErrors: any[];
}

export const uploadTransactionService = async (
  fileBuffer: Buffer
): Promise<UploadResult> => {

  const orm = await connectDB();
  if (!orm) throw new Error("Database connection failed");
  const em = orm.em.fork();

  // Read the file content as a UTF-8 string
  let fileContent = fileBuffer.toString("utf-8");

  // Remove Byte Order Mark (BOM) if present
  if (fileContent.charCodeAt(0) === 0xfeff) {
    fileContent = fileContent.slice(1);
  }

  // Arrays to track valid transactions, duplicates, and schema errors
  const transactions: Transctions[] = [];
  const duplicates: TransactionRow[] = [];
  const schemaErrors: any[] = [];

  // A Set to track duplicates within the same file (file-level duplicates)
  const seenTransactions = new Set<string>();

  // Parse the CSV content using PapaParse
  return new Promise((resolve, reject) => {
    Papa.parse<TransactionRow>(fileContent, {
      header: true, // Use the first row as the header
      skipEmptyLines: true, // Ignore empty lines in the file
      complete: async (results) => {
        for (const row of results.data) {
          const { Date: rawDate, Description, Amount, Currency } = row;

          // Convert the date from dd-mm-yyyy to yyyy-mm-dd format
          const parsedDate = rawDate.split("-").reverse().join("-");
          const dateObject = new Date(parsedDate);

          // Validate the date format
          if (!isValid(dateObject)) {
            schemaErrors.push({ row, message: "Invalid date format" });
            continue;
          }

          // Parse the Amount field as a float
          const parsedAmount = parseFloat(Amount);

          // Validate the required fields: Description, Amount, and Currency
          if (!Description || isNaN(parsedAmount) || !Currency) {
            schemaErrors.push({
              row,
              message:
                "Invalid schema: Missing required fields empty description/currency, or invalid amount",
            });
            continue;
          }

          // Create a unique key for file-level duplicate detection
          const uniqueKey = `${dateObject.toISOString()}-${Description}`;

          // Check for duplicates within the file
          if (seenTransactions.has(uniqueKey)) {
            duplicates.push(row);
            continue;
          }
          seenTransactions.add(uniqueKey);

          // Check for duplicates in the database (database-level duplicates)
          const exists = await em.findOne(Transctions, {
            Date: dateObject,
            Description,
          });
          if (exists) {
            duplicates.push(row);
            continue;
          }

          // Create a new transaction entity and populate it with data
          const transaction = new Transctions();
          transaction.Date = dateObject;
          transaction.Description = Description;
          transaction.Amount = parsedAmount;
          transaction.Currency = Currency;

          // Add the transaction to the list of valid transactions
          transactions.push(transaction);
        }
        // Save valid transactions to the database
        if (transactions.length > 0) {
          await em.persist(transactions).flush();
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
