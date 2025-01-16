import { connectDB } from "../../src/data/database";
import { Transctions } from "../../src/entities/Transctions";
import { getTransactionsService } from "../../src/services/getTransactionsService";

// Mock the `connectDB` function
jest.mock("../../src/data/database", () => ({
  connectDB: jest.fn(),
}));

describe("getTransactionsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return transactions with pagination and sorting", async () => {
    const mockParams = {
      page: 1,
      limit: 5,
      sort: "asc" as const,
    };

    const mockTransactions = [
      { id: 1, Description: "Transaction 1" },
      { id: 2, Description: "Transaction 2" },
    ];

    const mockFork = {
      find: jest.fn().mockResolvedValue(mockTransactions),
      count: jest.fn().mockResolvedValue(10), // Total count of transactions
    };

    const mockOrm = {
      em: { fork: jest.fn().mockReturnValue(mockFork) },
    };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);

    const result = await getTransactionsService(mockParams);

    expect(mockFork.find).toHaveBeenCalledWith(
      Transctions,
      {},
      {
        orderBy: { Date: mockParams.sort },
        limit: mockParams.limit,
        offset: 0, // (page - 1) * limit = (1 - 1) * 5 = 0
      }
    );
    expect(mockFork.count).toHaveBeenCalledWith(Transctions);
    expect(result).toEqual({
      transactions: mockTransactions,
      totalCount: 10,
      currentPage: 1,
      totalPages: 2, // totalCount / limit = 10 / 5 = 2
    });
  });

  it("should handle a different page and limit", async () => {
    const mockParams = {
      page: 2,
      limit: 3,
      sort: "desc" as const,
    };

    const mockTransactions = [
      { id: 4, Description: "Transaction 4" },
      { id: 5, Description: "Transaction 5" },
      { id: 6, Description: "Transaction 6" },
    ];

    const mockFork = {
      find: jest.fn().mockResolvedValue(mockTransactions),
      count: jest.fn().mockResolvedValue(20), // Total count of transactions
    };

    const mockOrm = {
      em: { fork: jest.fn().mockReturnValue(mockFork) },
    };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);

    const result = await getTransactionsService(mockParams);

    expect(mockFork.find).toHaveBeenCalledWith(
      Transctions,
      {},
      {
        orderBy: { Date: mockParams.sort },
        limit: mockParams.limit,
        offset: 3, // (page - 1) * limit = (2 - 1) * 3 = 3
      }
    );
    expect(mockFork.count).toHaveBeenCalledWith(Transctions);
    expect(result).toEqual({
      transactions: mockTransactions,
      totalCount: 20,
      currentPage: 2,
      totalPages: 7, // totalCount / limit = 20 / 3 = 6.67 → rounded up to 7
    });
  });

  it("should throw an error if the database connection fails", async () => {
    (connectDB as jest.Mock).mockResolvedValue(null);

    const mockParams: {
      page: number;
      limit: number;
      sort: "asc" | "desc";
    } = {
      page: 1,
      limit: 5,
      sort: "asc",
    };

    await expect(getTransactionsService(mockParams)).rejects.toThrow(
      "Failed to initialize the database connection"
    );
  });

  it("should return an empty array and count as 0 if no transactions exist", async () => {
    const mockParams = {
      page: 1,
      limit: 5,
      sort: "asc" as const,
    };

    const mockFork = {
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0), // Total count of transactions
    };

    const mockOrm = {
      em: { fork: jest.fn().mockReturnValue(mockFork) },
    };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);

    const result = await getTransactionsService(mockParams);

    expect(mockFork.find).toHaveBeenCalledWith(
      Transctions,
      {},
      {
        orderBy: { Date: mockParams.sort },
        limit: mockParams.limit,
        offset: 0, // (page - 1) * limit = (1 - 1) * 5 = 0
      }
    );
    expect(mockFork.count).toHaveBeenCalledWith(Transctions);
    expect(result).toEqual({
      transactions: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0, // No pages when totalCount is 0
    });
  });
});
