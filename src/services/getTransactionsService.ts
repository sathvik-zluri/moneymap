import { Transctions } from "../entities/Transctions";
import { GetTransactionsParams } from "../types/types";
import { getEntityManager } from "../data/getEntityManger";

export const getTransactionsService = async ({
  page,
  limit,
  sort,
}: GetTransactionsParams) => {
  const skip = (page - 1) * limit;
  const take = limit;

  // Fork the EntityManager for isolated database interaction
  const em = await getEntityManager();

  // Fetch transactions with pagination and sorting
  const transactions = await em.find(
    Transctions,
    { isDeleted: false },
    {
      orderBy: { Date: sort },
      limit: take,
      offset: skip,
    }
  );

  // Get the total count of transactions
  const totalCount = await em.count(Transctions);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  return {
    currentPage: page,
    totalPages,
    totalCount,
    transactions,
  };
};
