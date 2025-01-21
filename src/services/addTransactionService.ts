import { getEntityManager } from "../data/getEntityManger";
import { Transctions } from "../entities/Transctions";
import { AddTransactionParams } from "../types/types";
import { convertCurrency } from "../utils/exchangeRate";

export const addTransactionService = async ({
  rawDate,
  description,
  amount,
  currency,
}: AddTransactionParams) => {
  // Fork the EntityManager for isolated database interaction
  const em = await getEntityManager();

  //Checking duplicacy
  const duplicate = await em.findOne(Transctions, {
    Date: new Date(rawDate),
    Description: description,
    isDeleted: false,
  });

  if (duplicate) {
    const error = new Error("Transaction already exists");
    error.name = "ConflictError";
    throw error;
  }

  // Create a new transaction entity
  const transaction = new Transctions();

  transaction.Date = new Date(rawDate);
  transaction.Description = description;
  transaction.Amount = amount;
  transaction.Currency = currency;

  const { amountInr } = await convertCurrency(rawDate, currency, amount);
  transaction.AmountINR = amountInr;

  // Persist and save the transaction to the database
  await em.persist(transaction).flush();

  return transaction;
};
