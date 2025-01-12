import { connectDB } from "../data/database";
import { Transctions } from "../entities/Transctions";


export const deleteRowsService = async (): Promise<void> => {
    const orm = await connectDB();
  
    if (!orm) {
      throw new Error("Failed to initialize the database connection");
    }
  
    const em = orm.em.fork();
    await em.nativeDelete(Transctions, {});
};