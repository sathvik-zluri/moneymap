import { connectDB } from "../data/database";
import { Transctions } from "../entities/Transctions";

interface UpdateTransactionParams {
  id: number;
  date?: string; // Optional: date field
  description?: string; // Optional: description field
  amount?: number; // Optional: amount field
  currency?: string; // Optional: currency field
}

export const updateTransactionService = async ({
  id,
  date,
  description,
  amount,
  currency,
}: UpdateTransactionParams) => {
  // Connect to DB using connectDB utility
  const orm = await connectDB();

  if (!orm) {
    throw new Error("Failed to initialize the database connection");
  }

  // Fork the EntityManager for isolated database interaction
  const em = orm.em.fork();

  // Fetch the transaction by ID, excluding deleted ones
  const transaction = await em.findOne(Transctions, {
    id,
    isDeleted: false,
  });

  if (!transaction) {
    throw new Error("Transaction not found or ID invalid");
  }

  // Update the transaction properties if provided
  if (date) transaction.Date = new Date(date);
  if (description) transaction.Description = description;
  if (amount) transaction.Amount = amount;
  if (currency) transaction.Currency = currency;

  // Persist changes to the database
  await em.persist(transaction).flush();

  return transaction;
};
