import { Transctions } from "../entities/Transctions";
import { GetTransactionsParams } from "../types/types";
import { getEntityManager } from "../data/getEntityManger";
import moment from "moment";

export const getTransactionsService = async ({
  page,
  limit,
  sort,
  frequency,
  startDate,
  endDate,
}: GetTransactionsParams) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const filter: any = {};

  if (frequency && frequency !== "custom") {
    filter.Date = {
      $gte: moment().subtract(Number(frequency), "days").toDate(),
    };
  }

  if (startDate && endDate) {
    filter.Date = { $gte: startDate, $lte: endDate };
  }

  // Fork the EntityManager for isolated database interaction
  const em = await getEntityManager();

  const transactions = await em.getRepository(Transctions).find(
    { ...filter, isDeleted: false }, //Soft Delete condtion
    {
      orderBy: { Date: sort },
      limit: take,
      offset: skip,
    }
  );

  const totalCount = await em
    .getRepository(Transctions)
    .count({ ...filter, isDeleted: false });

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
