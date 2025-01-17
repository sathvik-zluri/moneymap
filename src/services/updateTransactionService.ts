import { connectDB } from "../data/database";
import { getEntityManager } from "../data/getEntityManger";
import { Transctions } from "../entities/Transctions";
import { UpdateTransactionParams } from "../types/types";
import { getTransactionById } from "./getTransactionById";

export const updateTransactionService = async ({
  id,
  rawDate,
  description,
  amount,
  currency,
}: UpdateTransactionParams) => {
  // Fork the EntityManager for isolated database interaction
  const em = await getEntityManager();

  // Fetch the transaction by ID, excluding deleted ones
  const transaction = (await getTransactionById(id, em)) as Transctions;

  // Update the transaction properties if provided
  if (rawDate) transaction.Date = new Date(rawDate);
  if (description) transaction.Description = description;
  if (amount) transaction.Amount = amount;
  if (currency) transaction.Currency = currency;

  // Persist changes to the database
  await em.persist(transaction).flush();

  return transaction;
};
