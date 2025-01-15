import { connectDB } from "../data/database";
import { Transctions } from "../entities/Transctions";
import { AddTransactionParams } from "../types/types";

export const addTransactionService = async ({
  rawDate,
  description,
  amount,
  currency,
}: AddTransactionParams) => {
  // Connect to DB using connectDB utility
  const orm = await connectDB();

  if (!orm) {
    throw new Error("Failed to initialize the database connection");
  }

  // Fork the EntityManager for isolated database interaction
  const em = orm.em.fork();

  // Create a new transaction entity
  const transaction = new Transctions();
  const parsedDate = new Date(rawDate); // Parsing the date from string to Date

  transaction.Date = parsedDate;
  transaction.Description = description;
  transaction.Amount = amount;
  transaction.Currency = currency;

  // Persist and save the transaction to the database
  await em.persist(transaction).flush();

  return transaction;
};
