import { connectDB } from "../data/database";
import { Transctions } from "../entities/Transctions";
import { UpdateTransactionParams } from "../types/types";

export const updateTransactionService = async ({
  id,
  rawDate,
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
  if (rawDate) transaction.Date = new Date(rawDate);
  if (description) transaction.Description = description;
  if (amount) transaction.Amount = amount;
  if (currency) transaction.Currency = currency;

  // Persist changes to the database
  await em.persist(transaction).flush();

  return transaction;
};
