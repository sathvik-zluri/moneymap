import { getEntityManager } from "../data/getEntityManger";
import { Transctions } from "../entities/Transctions";
import { getTransactionById } from "./getTransactionById";

export const deleteTransactionService = async (id: number): Promise<void> => {
  //Getting EntityManager
  const em = await getEntityManager();

  const transaction = (await getTransactionById(id, em)) as Transctions;

  // Soft delete: set isDeleted to true
  transaction.isDeleted = true;
  await em.persist(transaction).flush();
};
