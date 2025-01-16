import { Request, Response } from "express";

//services
import { getTransactionsService } from "../services/getTransactionsService";
import { addTransactionService } from "../services/addTransactionService";
import { updateTransactionService } from "../services/updateTransactionService";
import { deleteTransactionService } from "../services/deleteTransactionService";
import { uploadTransactionService } from "../services/uploadTransactionService";
import { deleteRowsService } from "../services/deleteRowsService";

//Get all transctions
export const getTransctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sort = "desc" } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (isNaN(parsedPage) || isNaN(parsedLimit)) {
      res.status(400).json({
        message: "Invalid page or limit",
        error: "Invalid page or limit",
      });
      return;
    }

    const validSortOrders = ["asc", "desc"];
    if (!validSortOrders.includes(sort as string)) {
      res.status(400).json({
        message: "Invalid sort order",
        error: "Invalid sort order",
      });
      return;
    }

    // Call the service to get transactions
    const { transactions, totalCount } = await getTransactionsService({
      page: parsedPage,
      limit: parsedLimit,
      sort: sort as "asc" | "desc",
    });

    // Return the fetched transactions along with the total count
    res.status(200).json({ data: transactions, totalCount });
  } catch (error: unknown) {
    console.error("Error fetching transactions:", error);

    res.status(500).json({
      message: "Failed to fetch transactions",
      error: "Database error",
    });
  }
};

//Add transctions
export const addTransctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { Date: rawDate, Description, Amount, Currency } = req.body;

  try {
    // Call the service to add the transaction
    const transaction = await addTransactionService({
      rawDate,
      description: Description,
      amount: Amount,
      currency: Currency,
    });

    res
      .status(201)
      .json({ message: "Transaction added successfully", transaction });

    return;
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({
      message: "Failed to add transaction",
      error: "Database error",
    });
    return;
  }
};

// Update transactions based on ID and perform validations
export const updateTransction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { Date: rawDate, Description, Amount, Currency } = req.body;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        message: "Invalid ID",
        error: "Invalid ID",
      });
      return;
    }

    // Call the service to update the transaction
    const transaction = await updateTransactionService({
      id: Number(id),
      rawDate,
      description: Description,
      amount: Number(Amount),
      currency: Currency,
    });

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({
      message: "Failed to update transaction",
      error: "Database error",
    });
  }
};

//Delete transctions based on id(soft Delete)
export const deleteTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        message: "Invalid ID",
        error: "Invalid ID",
      });
      return;
    }

    // Call the service to delete the transaction
    await deleteTransactionService(Number(id));

    res.status(200).json({ message: "Transaction deleted successfully" });
    return;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({
      message: "Failed to delete transaction",
      error: "Database error or ID invalid",
    });
  }
};

// Upload CSV file and process transactions
export const uploadTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const file = req.file;

    //call the service to upload the transaction
    const result = await uploadTransactionService(file!.buffer);

    res.status(200).json({
      message: result.message,
      transactionsSaved: result.transactionsSaved,
      duplicates: result.duplicates,
      schemaErrors: result.schemaErrors,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({
      message: "Failed to process file",
      error: "File processing error",
    });
  }
};

//Delete all rows
export const deleteRows = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Call the service to delete all rows
    await deleteRowsService();
    res
      .status(200)
      .json({ message: "All rows have been deleted successfully" });
  } catch (error) {
    console.error("Error deleting rows:", error);
    res.status(500).json({
      message: "Failed to delete rows",
      error: "Database error",
    });
  }
};
