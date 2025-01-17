import { connectDB } from "../../src/data/database";
import { Transctions } from "../../src/entities/Transctions";
import { updateTransactionService } from "../../src/services/updateTransactionService";

// Mock the `connectDB` function
jest.mock("../../src/data/database", () => ({
  connectDB: jest.fn(),
}));

describe("updateTransactionService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully update a transaction with all fields provided", async () => {
    const mockParams = {
      id: 1,
      rawDate: "2025-01-01",
      description: "Updated Description",
      amount: 200,
      currency: "USD",
    };

    const mockTransaction = {
      id: 1,
      Date: new Date(),
      Description: "Old Description",
      Amount: 100,
      Currency: "EUR",
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

    const result = await updateTransactionService(mockParams);

    expect(mockFork.findOne).toHaveBeenCalledWith(Transctions, {
      id: mockParams.id,
      isDeleted: false,
    });

    expect(mockTransaction.Date).toEqual(new Date(mockParams.rawDate));
    expect(mockTransaction.Description).toEqual(mockParams.description);
    expect(mockTransaction.Amount).toEqual(mockParams.amount);
    expect(mockTransaction.Currency).toEqual(mockParams.currency);

    expect(mockFork.persist).toHaveBeenCalledWith(mockTransaction);
    expect(mockFork.flush).toHaveBeenCalled();
    expect(result).toEqual(mockTransaction);
  });

  it("should update only provided fields", async () => {
    const mockParams = {
      id: 1,
      description: "Updated Description",
    };

    const mockTransaction = {
      id: 1,
      Date: new Date("2025-01-01"),
      Description: "Old Description",
      Amount: 100,
      Currency: "USD",
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

    const result = await updateTransactionService(mockParams);

    expect(mockFork.findOne).toHaveBeenCalledWith(Transctions, {
      id: mockParams.id,
      isDeleted: false,
    });

    expect(mockTransaction.Description).toEqual(mockParams.description);
    expect(mockTransaction.Date).toEqual(new Date("2025-01-01")); // Unchanged
    expect(mockTransaction.Amount).toEqual(100); // Unchanged
    expect(mockTransaction.Currency).toEqual("USD"); // Unchanged

    expect(mockFork.persist).toHaveBeenCalledWith(mockTransaction);
    expect(mockFork.flush).toHaveBeenCalled();
    expect(result).toEqual(mockTransaction);
  });
});
