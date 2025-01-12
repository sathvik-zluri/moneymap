import { connectDB } from "../data/database";
import { Transctions } from "../entities/Transctions";

// Define the type for parameters to add a transaction
interface AddTransactionParams {
    date: string; // Date as a string (ISO format)
    description: string; 
    amount: number;
    currency: string; 
}

export const addTransactionService = async ({
    date,
    description,
    amount,
    currency,
  }: AddTransactionParams) => {

    // Connect to DB using connectDB utility
    const orm = await connectDB();

    if (!orm) {
      throw new Error("Failed to initialize the database connection");
    }
  
    // Fork the EntityManager for isolated database interaction
    const em = orm.em.fork();
  
    // Create a new transaction entity
    const transaction = new Transctions();
    const parsedDate = new Date(date); // Parsing the date from string to Date
  
    transaction.Date = parsedDate; 
    transaction.Description = description; 
    transaction.Amount = amount; 
    transaction.Currency = currency;
  
    // Persist and save the transaction to the database
    await em.persist(transaction).flush();
  
    return transaction; 
  };