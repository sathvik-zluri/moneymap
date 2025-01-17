import { connectDB } from "./database";
import { EntityManager } from "@mikro-orm/core";

export const getEntityManager = async (): Promise<EntityManager> => {
  const orm = await connectDB();
  return orm.em.fork();
};
