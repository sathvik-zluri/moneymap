import { connectDB } from "../../src/data/database";
import { Transctions } from "../../src/entities/Transctions";
import { deleteTransactionService } from "../../src/services/deleteTransactionService";

// Mock the `connectDB` function
jest.mock("../../src/data/database", () => ({
  connectDB: jest.fn(),
}));

describe("deleteTransactionService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully soft-delete a transaction when a valid ID is provided", async () => {
    const mockId = 1;
    const mockTransaction = {
      id: mockId,
      isDeleted: false,
    };

    const mockFork = {
      findOne: jest.fn().mockResolvedValue(mockTransaction),
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    const mockOrm = {
      em: { fork: jest.fn().mockReturnValue(mockFork) },
    };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);

    await deleteTransactionService(mockId);

    expect(mockFork.findOne).toHaveBeenCalledWith(Transctions, {
      id: mockId,
      isDeleted: false,
    });

    expect(mockTransaction.isDeleted).toBe(true);
    expect(mockFork.persist).toHaveBeenCalledWith(mockTransaction);
    expect(mockFork.flush).toHaveBeenCalled();
  });

  it("should throw an error if the ID is not provided", async () => {
    await expect(
      deleteTransactionService(null as unknown as number)
    ).rejects.toThrow("Transaction ID is required");
  });

  it("should throw an error if the database connection fails", async () => {
    (connectDB as jest.Mock).mockResolvedValue(null);

    const mockId = 1;

    await expect(deleteTransactionService(mockId)).rejects.toThrow(
      "Failed to initialize the database connection"
    );
  });

  it("should throw an error if the transaction is not found", async () => {
    const mockId = 99;

    const mockFork = {
      findOne: jest.fn().mockResolvedValue(null), // No transaction found
    };

    const mockOrm = {
      em: { fork: jest.fn().mockReturnValue(mockFork) },
    };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);

    await expect(deleteTransactionService(mockId)).rejects.toThrow(
      "Transaction not found or ID invalid"
    );

    expect(mockFork.findOne).toHaveBeenCalledWith(Transctions, {
      id: mockId,
      isDeleted: false,
    });
  });
});
