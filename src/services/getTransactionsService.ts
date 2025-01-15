import { connectDB } from "../data/database";
import { Transctions } from "../entities/Transctions";
import { GetTransactionsParams } from "../types/types";

export const getTransactionsService = async ({
  page,
  limit,
  sort,
}: GetTransactionsParams) => {
  const skip = (page - 1) * limit;
  const take = limit;

  // Connect to DB using connectDB utility
  const orm = await connectDB();

  if (!orm) {
    throw new Error("Failed to initialize the database connection");
  }

  // Fork the EntityManager for isolated database interaction
  const em = orm.em.fork();

  // Fetch transactions with pagination and sorting
  const transactions = await em.find(
    Transctions,
    {},
    {
      orderBy: { Date: sort },
      limit: take,
      offset: skip,
    }
  );

  // Get the total count of transactions
  const totalCount = await em.count(Transctions);

  return { transactions, totalCount };
};
