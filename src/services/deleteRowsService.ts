import { getEntityManager } from "../data/getEntityManger";
import { Transctions } from "../entities/Transctions";

export const deleteRowsService = async (): Promise<void> => {
  const em = await getEntityManager();
  await em.nativeDelete(Transctions, {});
};
