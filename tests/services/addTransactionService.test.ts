import { getEntityManager } from "../../src/data/getEntityManger";
import { addTransactionService } from "../../src/services/addTransactionService";
import { Transctions } from "../../src/entities/Transctions";

// Mock the `getEntityManager` function
jest.mock("../../src/data/getEntityManger", () => ({
  getEntityManager: jest.fn(),
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
      findOne: jest.fn().mockResolvedValue(null), // No duplicate found
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    (getEntityManager as jest.Mock).mockResolvedValue(mockFork);

    const result = await addTransactionService(mockTransaction);

    expect(mockFork.findOne).toHaveBeenCalledWith(Transctions, {
      Date: new Date(mockTransaction.rawDate),
      Description: mockTransaction.description,
      isDeleted: false,
    });
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

  it("should throw a ConflictError if a duplicate transaction exists", async () => {
    const mockTransaction = {
      rawDate: "2025-01-12",
      description: "Duplicate Transaction",
      amount: 100,
      currency: "USD",
    };

    const mockFork = {
      findOne: jest.fn().mockResolvedValue({ id: 1, ...mockTransaction }), // Duplicate found
      persist: jest.fn(),
      flush: jest.fn(),
    };

    (getEntityManager as jest.Mock).mockResolvedValue(mockFork);

    await expect(addTransactionService(mockTransaction)).rejects.toThrowError(
      expect.objectContaining({
        name: "ConflictError",
        message: "Transaction already exists",
      })
    );

    expect(mockFork.findOne).toHaveBeenCalledWith(Transctions, {
      Date: new Date(mockTransaction.rawDate),
      Description: mockTransaction.description,
      isDeleted: false,
    });
    expect(mockFork.persist).not.toHaveBeenCalled();
    expect(mockFork.flush).not.toHaveBeenCalled();
  });

  it("should throw an error if saving the transaction fails", async () => {
    const mockTransaction = {
      rawDate: "2025-01-12",
      description: "Valid Transaction",
      amount: 100,
      currency: "USD",
    };

    const mockFork = {
      findOne: jest.fn().mockResolvedValue(null), // No duplicate found
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn().mockRejectedValue(new Error("Database Error")),
    };

    (getEntityManager as jest.Mock).mockResolvedValue(mockFork);

    await expect(addTransactionService(mockTransaction)).rejects.toThrow(
      "Database Error"
    );

    expect(mockFork.findOne).toHaveBeenCalledWith(Transctions, {
      Date: new Date(mockTransaction.rawDate),
      Description: mockTransaction.description,
      isDeleted: false,
    });
    expect(mockFork.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        Date: new Date(mockTransaction.rawDate),
        Description: mockTransaction.description,
        Amount: mockTransaction.amount,
        Currency: mockTransaction.currency,
      })
    );
    expect(mockFork.flush).toHaveBeenCalled();
  });
});
