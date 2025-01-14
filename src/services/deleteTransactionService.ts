import { connectDB } from "../data/database";
import { Transctions } from "../entities/Transctions";


export const deleteTransactionService = async (id: number): Promise<void> => {
    if (!id) {
      throw new Error("Transaction ID is required");
    }
  
    const orm = await connectDB();
    if (!orm) {
      throw new Error("Failed to initialize the database connection");
    }
  
    const em = orm.em.fork();
  
    const transaction = await em.findOne(Transctions, {
      id,
      isDeleted: false,
    });
  
    if (!transaction) {
      throw new Error("Transaction not found or ID invalid");
    }
  
    // Soft delete: set isDeleted to true
    transaction.isDeleted = true;
    await em.persist(transaction).flush();
};