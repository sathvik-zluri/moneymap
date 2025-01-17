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
});
