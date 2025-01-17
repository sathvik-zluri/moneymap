import { Transctions } from "../entities/Transctions";
import { EntityManager } from "@mikro-orm/core";

// Function to get transaction by ID
export const getTransactionById = async (
  id: number,
  em: EntityManager
): Promise<Transctions | null> => {
  try {
    // Fetch the transaction by ID and ensure it's not deleted
    const transaction = await em.findOne(Transctions, { id, isDeleted: false });

    return transaction; // Return the transaction if found, otherwise null
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    throw new Error("Error fetching transaction from database");
  }
};
