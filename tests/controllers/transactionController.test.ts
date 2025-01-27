import { Request, Response } from "express";

// Mock the services
import { addTransactionService } from "../../src/services/addTransactionService";
import { deleteRowsService } from "../../src/services/deleteRowsService";
import { deleteTransactionService } from "../../src/services/deleteTransactionService";
import { getTransactionsService } from "../../src/services/getTransactionsService";
import { updateTransactionService } from "../../src/services/updateTransactionService";
import { uploadTransactionService } from "../../src/services/uploadTransactionService";
import {
  addTransctions,
  deleteRows,
  deleteTransaction,
  getTransctions,
  updateTransction,
  uploadTransactions,
} from "../../src/controllers/transactionController";

// Mocking the services
jest.mock("../../src/services/addTransactionService");
jest.mock("../../src/services/deleteRowsService");
jest.mock("../../src/services/deleteTransactionService");
jest.mock("../../src/services/getTransactionsService");
jest.mock("../../src/services/updateTransactionService");
jest.mock("../../src/services/uploadTransactionService");

describe("Transaction Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/txns/list", () => {
    it("should return a list of transactions", async () => {
      const mockRequest = {
        query: { page: "1", limit: "10", sort: "asc" },
      } as unknown as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (getTransactionsService as jest.Mock).mockResolvedValue({
        transactions: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      });

      await getTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        pagination: {
          currentPage: 1,
          totalCount: 0,
          totalPages: 0,
        },
      });
    });

    it("should return transactions filtered by custom date range and frequency when frequency is provided", async () => {
      const mockRequest = {
        query: {
          page: "1",
          limit: "10",
          sort: "asc",
          frequency: "7", // Frequency provided
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-07T23:59:59.999Z",
        },
      } as unknown as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockTransactions = [
        {
          id: 1,
          Description: "Transaction 1",
          Date: new Date("2025-01-03T10:00:00.000Z"),
        },
        {
          id: 2,
          Description: "Transaction 2",
          Date: new Date("2025-01-05T12:30:00.000Z"),
        },
      ];

      (getTransactionsService as jest.Mock).mockResolvedValue({
        transactions: mockTransactions,
        totalCount: 2,
        currentPage: 1,
        totalPages: 1,
      });

      await getTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTransactions,
        pagination: {
          currentPage: 1,
          totalCount: 2,
          totalPages: 1,
        },
      });

      expect(getTransactionsService).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sort: "asc",
        frequency: "7", // Ensure the frequency is passed as a string
        startDate: new Date("2025-01-01T00:00:00.000Z"),
        endDate: new Date("2025-01-07T23:59:59.999Z"),
      });
    });

    it("should return transactions filtered by custom date range when startDate and endDate are provided", async () => {
      const mockRequest = {
        query: {
          page: "1",
          limit: "10",
          sort: "asc",
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-07T23:59:59.999Z",
        },
      } as unknown as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockTransactions = [
        {
          id: 1,
          Description: "Transaction 1",
          Date: new Date("2025-01-03T10:00:00.000Z"),
        },
        {
          id: 2,
          Description: "Transaction 2",
          Date: new Date("2025-01-05T12:30:00.000Z"),
        },
      ];

      (getTransactionsService as jest.Mock).mockResolvedValue({
        transactions: mockTransactions,
        totalCount: 2,
        currentPage: 1,
        totalPages: 1,
      });

      await getTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockTransactions,
        pagination: {
          currentPage: 1,
          totalCount: 2,
          totalPages: 1,
        },
      });

      expect(getTransactionsService).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sort: "asc",
        frequency: undefined, // Match actual behavior
        startDate: new Date("2025-01-01T00:00:00.000Z"),
        endDate: new Date("2025-01-07T23:59:59.999Z"),
      });
    });

    it("should return transactions with default values when query parameters are not provided", async () => {
      const mockRequest = {
        query: {}, // Empty query to trigger default values
      } as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (getTransactionsService as jest.Mock).mockResolvedValue({
        transactions: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      });

      await getTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        pagination: {
          currentPage: 1,
          totalCount: 0,
          totalPages: 0,
        },
      });
    });

    it("should return transactions when query parameters are provided", async () => {
      const mockRequest = {
        query: { page: "2", limit: "5", sort: "asc" }, // Providing valid query parameters
      } as unknown as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (getTransactionsService as jest.Mock).mockResolvedValue({
        transactions: [],
        totalCount: 0,
        currentPage: 2,
        totalPages: 0,
      });

      await getTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [],
        pagination: {
          currentPage: 2,
          totalCount: 0,
          totalPages: 0,
        },
      });
    });

    it("should handle errors while fetching transactions", async () => {
      const mockRequest = {
        query: { page: "1", limit: "10", sort: "desc" },
      } as unknown as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Simulate an error from the service
      (getTransactionsService as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await getTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to fetch transactions",
        error: "Database error",
      });
    });
  });

  describe("POST /api/v1/txns/add", () => {
    it("should add a new transaction", async () => {
      const newTransaction = {
        Date: "2023-01-01",
        Description: "Test",
        Amount: 100,
        Currency: "USD",
      };

      const mockRequest = {
        body: newTransaction,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (addTransactionService as jest.Mock).mockResolvedValue({
        ...newTransaction,
        id: 1,
      });

      await addTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Transaction added successfully",
        transaction: { ...newTransaction, id: 1 },
      });
    });

    it("should handle ConflictError when the transaction already exists", async () => {
      const newTransaction = {
        Date: "2023-01-01",
        Description: "Test",
        Amount: 100,
        Currency: "USD",
      };

      const mockRequest = {
        body: newTransaction,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const conflictError = new Error("Transaction already exists") as any;
      conflictError.name = "ConflictError";

      (addTransactionService as jest.Mock).mockRejectedValue(conflictError);

      await addTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Transaction already exists",
        error: "Transaction already exists",
      });
    });

    it("should handle AxiosErrorCurrency while adding a transaction", async () => {
      const newTransaction = {
        Date: "2013-12-31",
        Description: "Test",
        Amount: 100,
        Currency: "USD",
      };

      const mockRequest = {
        body: newTransaction,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const axiosError = new Error("Currency conversion failed") as any;
      axiosError.name = "AxiosErrorCurrency";
      axiosError.statusCode = 400;

      (addTransactionService as jest.Mock).mockRejectedValue(axiosError);

      await addTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to convert currency",
        error: "Currency conversion failed",
      });
    });

    it("should handle errors while adding a transaction", async () => {
      const newTransaction = {
        Date: "2023-01-01",
        Description: "Test",
        Amount: 100,
        Currency: "USD",
      };

      const mockRequest = {
        body: newTransaction,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (addTransactionService as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await addTransctions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to add transaction",
        error: "Database error",
      });
    });
  });

  describe("PUT /api/v1/txns/update/:id", () => {
    it("should update a transaction", async () => {
      const updatedTransaction = {
        Date: "2023-02-01",
        Description: "Updated",
        Amount: 150,
        Currency: "USD",
      };

      const mockRequest = {
        params: { id: "1" },
        body: updatedTransaction,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (updateTransactionService as jest.Mock).mockResolvedValue(
        updatedTransaction
      );

      await updateTransction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Transaction updated successfully",
        transaction: updatedTransaction,
      });
    });

    it("should handle AxiosErrorCurrency while updating a transaction", async () => {
      const updatedTransaction = {
        Date: "2025-01-21",
        Description: "Updated",
        Amount: 150,
        Currency: "USD",
      };

      const mockRequest = {
        params: { id: "1" },
        body: updatedTransaction,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const axiosError = new Error("Currency conversion failed") as any;
      axiosError.name = "AxiosErrorCurrency";
      axiosError.statusCode = 400;

      (updateTransactionService as jest.Mock).mockRejectedValue(axiosError);

      await updateTransction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to convert currency",
        error: "Currency conversion failed",
      });
    });

    it("should handle errors while updating a transaction", async () => {
      const updatedTransaction = {
        Date: "2023-02-01",
        Description: "Updated",
        Amount: 150,
        Currency: "USD",
      };

      const mockRequest = {
        params: { id: "1" },
        body: updatedTransaction,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (updateTransactionService as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await updateTransction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to update transaction",
        error: "Database error",
      });
    });
  });

  describe("DELETE /api/v1/txns/delete/:id", () => {
    it("should delete a transaction", async () => {
      const mockRequest = {
        params: { id: "1" },
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (deleteTransactionService as jest.Mock).mockResolvedValue(undefined);

      await deleteTransaction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Transaction deleted successfully",
      });
    });

    it("should handle errors while deleting a transaction", async () => {
      const mockRequest = {
        params: { id: "1" },
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (deleteTransactionService as jest.Mock).mockRejectedValue(
        new Error("Database error or ID invalid")
      );

      await deleteTransaction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to delete transaction",
        error: "Database error or ID invalid",
      });
    });
  });

  describe("POST /api/v1/txns/uploadcsv", () => {
    it("should upload a file and process transactions", async () => {
      const mockFile = {
        buffer: Buffer.from(
          "Date,Description,Amount,Currency\n01-01-2023,Test,100,USD"
        ),
      };

      const mockRequest = {
        file: mockFile,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (uploadTransactionService as jest.Mock).mockResolvedValue({
        message: "File processed successfully",
        transactionsSaved: 1,
        duplicates: [],
        schemaErrors: [],
      });

      await uploadTransactions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "File processed successfully",
        transactionsSaved: 1,
        duplicates: [],
        schemaErrors: [],
      });
    });

    it("should handle AxiosErrorCurrency while uploading a file", async () => {
      const mockFile = {
        buffer: Buffer.from(
          "Date,Description,Amount,Currency\n2013-12-31,Test,100,USD" // Out of valid range
        ),
      };

      const mockRequest = {
        file: mockFile,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const axiosError = new Error(
        "Currency conversion failed for some rows"
      ) as any;
      axiosError.name = "AxiosErrorCurrency";
      axiosError.statusCode = 400;

      (uploadTransactionService as jest.Mock).mockRejectedValue(axiosError);

      await uploadTransactions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to convert currency for some rows",
        error: "Currency conversion failed for some rows",
      });
    });

    it("should handle errors while uploading a file", async () => {
      const mockFile = {
        buffer: Buffer.from(
          "Date,Description,Amount,Currency\n01-01-2023,Test,100,USD"
        ),
      };

      const mockRequest = {
        file: mockFile,
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (uploadTransactionService as jest.Mock).mockRejectedValue(
        new Error("File processing error")
      );

      await uploadTransactions(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to process file",
        error: "File processing error",
      });
    });
  });

  describe("DELETE /api/v1/txns/delete-data", () => {
    it("should delete all rows", async () => {
      const mockRequest = {} as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (deleteRowsService as jest.Mock).mockResolvedValue(undefined);

      await deleteRows(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "All rows have been deleted successfully",
      });
    });

    it("should handle errors while deleting all rows", async () => {
      const mockRequest = {} as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (deleteRowsService as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await deleteRows(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to delete rows",
        error: "Database error",
      });
    });
  });
});
