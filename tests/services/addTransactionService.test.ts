import { connectDB } from "../../src/data/database";
import { addTransactionService } from "../../src/services/addTransactionService";

// Mock the `connectDB` function
jest.mock("../../src/data/database", () => ({
    connectDB: jest.fn(),
  }));

describe("addTransactionService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully add a transaction to the database", async () => {
    const mockTransaction = {
      rawDate: "2025-01-12",
      description: "Valid Transaction",
      amount: 100,
      currency: "USD",
    };

    const mockFork = {
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    const mockOrm = {
      em: { fork: jest.fn().mockReturnValue(mockFork) },
    };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);

    const result = await addTransactionService(mockTransaction);

    expect(mockFork.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        Date: new Date(mockTransaction.rawDate),
        Description: mockTransaction.description,
        Amount: mockTransaction.amount,
        Currency: mockTransaction.currency,
      })
    );
    expect(mockFork.flush).toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        Date: new Date(mockTransaction.rawDate),
        Description: mockTransaction.description,
        Amount: mockTransaction.amount,
        Currency: mockTransaction.currency,
      })
    );
  });

  it("should throw an error if the database connection fails", async () => {
    (connectDB as jest.Mock).mockResolvedValue(null);

    const mockTransaction = {
      rawDate: "2025-01-12",
      description: "Transaction",
      amount: 100,
      currency: "USD",
    };

    await expect(addTransactionService(mockTransaction)).rejects.toThrow(
      "Failed to initialize the database connection"
    );
  });

  it("should throw an error if saving the transaction fails", async () => {
    const mockFork = {
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn().mockRejectedValue(new Error("Database Error")),
    };

    const mockOrm = {
      em: { fork: jest.fn().mockReturnValue(mockFork) },
    };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);

    const mockTransaction = {
      rawDate: "2025-01-12",
      description: "Transaction",
      amount: 100,
      currency: "USD",
    };

    await expect(addTransactionService(mockTransaction)).rejects.toThrow("Database Error");
  });
});
