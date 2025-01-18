import { Transctions } from "../entities/Transctions";
import { GetTransactionsParams } from "../types/types";
import { getEntityManager } from "../data/getEntityManger";
import moment from "moment";

export const getTransactionsService = async ({
  page,
  limit,
  sort,
  frequency = "7",
}: GetTransactionsParams) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const startDate = moment().subtract(Number(frequency), "days").toDate();

  // Fork the EntityManager for isolated database interaction
  const em = await getEntityManager();

  // Use the `find` method to filter transactions
  const transactions = await em
    .getRepository(Transctions) // Get repository for the entity
    .find(
      {
        Date: { $gte: startDate }, // Filter transactions by date (greater than or equal to the start date)
      },
      {
        orderBy: { Date: sort }, // Sort by transactionDate (asc or desc)
        limit, // Limit results to the specified number
        offset: (page - 1) * limit, // Apply pagination offset
      }
    );
  // Fetch total count for pagination (without limit and offset)
  const totalCount = await em.getRepository(Transctions).count({
    Date: { $gte: startDate }, // Filter by date
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = page;

  return {
    transactions,
    totalCount,
    currentPage,
    totalPages,
  };
};
