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
    const { page, limit, sort, frequency, startDate, endDate } = req.query;

    // Call the service to get transactions
    const { transactions, totalCount, currentPage, totalPages } =
      await getTransactionsService({
        page: Number(page),
        limit: Number(limit),
        sort: sort as "asc" | "desc",
        frequency: frequency ? String(frequency) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

    // Return the fetched transactions along with pagination info
    res.status(200).json({
      data: transactions,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
      },
    });
  } catch (error) {
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
  } catch (error: any) {
    console.error("Error adding transaction:", error);
    if (error.name === "AxiosErrorCurrency") {
      res.status(400).json({
        message: "Failed to convert currency",
        error: error.message,
      });
    } else if (error.name === "ConflictError") {
      res.status(409).json({
        message: "Transaction already exists",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Failed to add transaction",
        error: "Database error",
      });
    }
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
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    if (error.name === "AxiosErrorCurrency") {
      res.status(400).json({
        message: "Failed to convert currency",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Failed to update transaction",
        error: "Database error",
      });
    }
  }
};

//Delete transctions based on id(soft Delete)
export const deleteTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

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
  } catch (error: any) {
    console.error("Error processing file:", error);
    if (error.name === "AxiosErrorCurrency") {
      res.status(400).json({
        message: "Failed to convert currency for some rows",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Failed to process file",
        error: "File processing error",
      });
    }
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
