import { getTransactionsService } from "../../src/services/getTransactionsService";
import { getEntityManager } from "../../src/data/getEntityManger";
import moment from "moment";

// Mock the `getEntityManager` function
jest.mock("../../src/data/getEntityManger", () => ({
  getEntityManager: jest.fn(),
}));

jest.mock("moment", () => {
  const originalMoment = jest.requireActual("moment");
  return jest.fn(() => originalMoment("2025-01-13T15:08:56.592Z"));
});

describe("getTransactionsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return transactions with pagination and sorting", async () => {
    const mockParams = {
      page: 1,
      limit: 5,
      sort: "asc" as const,
      frequency: "7", // Added frequency
    };

    const mockTransactions = [
      { id: 1, Description: "Transaction 1", Date: new Date() },
      { id: 2, Description: "Transaction 2", Date: new Date() },
    ];

    const mockRepository = {
      find: jest.fn().mockResolvedValue(mockTransactions),
      count: jest.fn().mockResolvedValue(10), // Total count of transactions
    };

    (getEntityManager as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepository),
    });

    const result = await getTransactionsService(mockParams);

    const startDate = moment()
      .subtract(Number(mockParams.frequency), "days")
      .toDate();

    expect(mockRepository.find).toHaveBeenCalledWith(
      {
        Date: { $gte: startDate },
        isDeleted: false,
      },
      {
        orderBy: { Date: mockParams.sort },
        limit: mockParams.limit,
        offset: 0, // (page - 1) * limit = (1 - 1) * 5 = 0
      }
    );
    expect(mockRepository.count).toHaveBeenCalledWith({
      Date: { $gte: startDate },
      isDeleted: false,
    });
    expect(result).toEqual({
      transactions: mockTransactions,
      totalCount: 10,
      currentPage: 1,
      totalPages: 2, // totalCount / limit = 10 / 5 = 2
    });
  });

  it("should filter transactions by custom date range when startDate and endDate are provided", async () => {
    const mockParams = {
      page: 1,
      limit: 5,
      sort: "asc" as const,
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2025-01-07T23:59:59.999Z"),
    };

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

    const mockRepository = {
      find: jest.fn().mockResolvedValue(mockTransactions),
      count: jest.fn().mockResolvedValue(2), // Total count of transactions in the range
    };

    (getEntityManager as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepository),
    });

    const result = await getTransactionsService(mockParams);

    expect(mockRepository.find).toHaveBeenCalledWith(
      {
        Date: { $gte: mockParams.startDate, $lte: mockParams.endDate },
        isDeleted: false,
      },
      {
        orderBy: { Date: mockParams.sort },
        limit: mockParams.limit,
        offset: 0, // (page - 1) * limit = (1 - 1) * 5 = 0
      }
    );
    expect(mockRepository.count).toHaveBeenCalledWith({
      Date: { $gte: mockParams.startDate, $lte: mockParams.endDate },
      isDeleted: false,
    });
    expect(result).toEqual({
      transactions: mockTransactions,
      totalCount: 2,
      currentPage: 1,
      totalPages: 1, // totalCount / limit = 2 / 5 = 0.4 → rounded up to 1
    });
  });

  it("should return an empty array and count as 0 if no transactions exist", async () => {
    const mockParams = {
      page: 1,
      limit: 5,
      sort: "asc" as const,
      frequency: "7", // Added frequency
    };

    const mockRepository = {
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0), // Total count of transactions
    };

    (getEntityManager as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepository),
    });

    const result = await getTransactionsService(mockParams);

    const startDate = moment()
      .subtract(Number(mockParams.frequency), "days")
      .toDate();

    expect(mockRepository.find).toHaveBeenCalledWith(
      {
        Date: { $gte: startDate },
        isDeleted: false,
      },
      {
        orderBy: { Date: mockParams.sort },
        limit: mockParams.limit,
        offset: 0, // (page - 1) * limit = (1 - 1) * 5 = 0
      }
    );
    expect(mockRepository.count).toHaveBeenCalledWith({
      Date: { $gte: startDate },
      isDeleted: false,
    });
    expect(result).toEqual({
      transactions: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0, // No pages when totalCount is 0
    });
  });
});
