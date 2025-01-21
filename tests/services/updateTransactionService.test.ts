import { updateTransactionService } from "../../src/services/updateTransactionService";
import { getEntityManager } from "../../src/data/getEntityManger";
import { getTransactionById } from "../../src/services/getTransactionById";
import { convertCurrency } from "../../src/utils/exchangeRate";

// Mock external dependencies
jest.mock("../../src/data/getEntityManger", () => ({
  getEntityManager: jest.fn(),
}));

jest.mock("../../src/services/getTransactionById", () => ({
  getTransactionById: jest.fn(),
}));

jest.mock("../../src/utils/exchangeRate", () => ({
  convertCurrency: jest.fn(),
}));

describe("updateTransactionService", () => {
  afterEach(() => {
    jest.clearAllMocks();
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
      AmountINR: 8000,
      isDeleted: false,
    };

    const mockEntityManager = {
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    // Mock getTransactionById to return the mock transaction
    (getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);

    // Mock getEntityManager to return a mocked entity manager
    (getEntityManager as jest.Mock).mockResolvedValue(mockEntityManager);

    // Mock convertCurrency to return a default value (even if it shouldn't be called)
    (convertCurrency as jest.Mock).mockResolvedValue({
      amountInr: mockTransaction.AmountINR,
    });

    const result = await updateTransactionService(mockParams);

    expect(getTransactionById).toHaveBeenCalledWith(
      mockParams.id,
      mockEntityManager
    );
    expect(mockTransaction.Description).toEqual(mockParams.description);
    expect(mockTransaction.Date).toEqual(new Date("2025-01-01")); // Unchanged
    expect(mockTransaction.Amount).toEqual(100); // Unchanged
    expect(mockTransaction.Currency).toEqual("USD"); // Unchanged

    expect(mockEntityManager.persist).toHaveBeenCalledWith(mockTransaction);
    expect(mockEntityManager.flush).toHaveBeenCalled();
    expect(result).toEqual(mockTransaction);
  });

  it("should update rawDate when provided", async () => {
    const mockParams = {
      id: 1,
      rawDate: "2025-02-01",
    };

    const mockTransaction = {
      id: 1,
      Date: new Date("2025-01-01"),
      Description: "Old Description",
      Amount: 100,
      Currency: "USD",
      AmountINR: 8000,
      isDeleted: false,
    };

    const mockEntityManager = {
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    (getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);
    (getEntityManager as jest.Mock).mockResolvedValue(mockEntityManager);

    const result = await updateTransactionService(mockParams);

    expect(mockTransaction.Date).toEqual(new Date(mockParams.rawDate)); // Updated
    expect(mockEntityManager.persist).toHaveBeenCalledWith(mockTransaction);
    expect(mockEntityManager.flush).toHaveBeenCalled();
    expect(result).toEqual(mockTransaction);
  });

  it("should update amount, currency, and INR amount when either changes", async () => {
    const mockParams = {
      id: 1,
      amount: 150, // New amount, different from the current one
      currency: "EUR", // New currency, different from the current one
    };

    const mockTransaction = {
      id: 1,
      Date: new Date("2025-01-01"),
      Description: "Old Description",
      Amount: 100, // Old amount
      Currency: "USD", // Old currency
      AmountINR: 8000,
      isDeleted: false,
    };

    const mockEntityManager = {
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    const mockConvertedCurrency = { amountInr: 13000 };

    // Mock the dependencies
    (getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);
    (getEntityManager as jest.Mock).mockResolvedValue(mockEntityManager);
    (convertCurrency as jest.Mock).mockResolvedValue(mockConvertedCurrency);

    // Call the service
    const result = await updateTransactionService(mockParams);

    // Assertions
    expect(mockTransaction.Amount).toEqual(mockParams.amount); // Updated
    expect(mockTransaction.Currency).toEqual(mockParams.currency); // Updated
    expect(mockTransaction.AmountINR).toEqual(mockConvertedCurrency.amountInr); // INR amount updated

    expect(mockEntityManager.persist).toHaveBeenCalledWith(mockTransaction);
    expect(mockEntityManager.flush).toHaveBeenCalled();
    expect(result).toEqual(mockTransaction);
  });
  it("should update amount and currency with converted INR amount", async () => {
    const mockParams = {
      id: 1,
      amount: 200,
      currency: "EUR",
    };

    const mockTransaction = {
      id: 1,
      Date: new Date("2025-01-01"),
      Description: "Old Description",
      Amount: 100,
      Currency: "USD",
      AmountINR: 8000,
      isDeleted: false,
    };

    const mockEntityManager = {
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    const mockConvertedCurrency = { amountInr: 16000 };

    // Mock getTransactionById to return the mock transaction
    (getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);

    // Mock getEntityManager to return a mocked entity manager
    (getEntityManager as jest.Mock).mockResolvedValue(mockEntityManager);

    // Mock convertCurrency to return a mocked conversion result
    (convertCurrency as jest.Mock).mockResolvedValue(mockConvertedCurrency);

    const result = await updateTransactionService(mockParams);

    expect(getTransactionById).toHaveBeenCalledWith(
      mockParams.id,
      mockEntityManager
    );
    expect(convertCurrency).toHaveBeenCalledWith(
      "",
      mockParams.currency,
      mockParams.amount
    );

    expect(mockTransaction.Amount).toEqual(mockParams.amount);
    expect(mockTransaction.Currency).toEqual(mockParams.currency);
    expect(mockTransaction.AmountINR).toEqual(mockConvertedCurrency.amountInr);

    expect(mockEntityManager.persist).toHaveBeenCalledWith(mockTransaction);
    expect(mockEntityManager.flush).toHaveBeenCalled();
    expect(result).toEqual(mockTransaction);
  });
});
