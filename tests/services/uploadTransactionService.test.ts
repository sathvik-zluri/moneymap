import Papa from "papaparse";
import { uploadTransactionService } from "../../src/services/uploadTransactionService";
import { connectDB } from "../../src/data/database";
import { Transctions } from "../../src/entities/Transctions";

// Mock the `connectDB` function and the entity manager
jest.mock("../../src/data/database", () => ({
  connectDB: jest.fn(),
}));

// Mock the `isValid` function from `date-fns`
jest.mock("date-fns", () => ({
  isValid: jest.fn(() => true),
}));

jest.mock("papaparse", () => ({
  parse: jest.fn(),
}));

describe("uploadTransactionService", () => {
  let mockEm: any;
  let mockOrm: any;

  beforeEach(() => {
    mockEm = {
      findOne: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
    };
    mockOrm = { em: { fork: jest.fn().mockReturnValue(mockEm) } };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should process a valid CSV file and save transactions", async () => {
    const csvContent = `
          Date,Description,Amount,Currency
          2023-01-01,Test Transaction,100,USD
        `;
    const buffer = Buffer.from(csvContent, "utf-8");

    mockEm.findOne.mockResolvedValue(null); // No duplicates in the database

    // Mock the persist and flush behavior
    const mockPersist = jest.fn().mockReturnThis(); // Make `persist` chainable
    mockEm.persist = mockPersist;
    mockEm.flush = jest.fn().mockResolvedValue(undefined); // Ensure `flush` resolves without errors

    jest.requireMock("date-fns").isValid.mockReturnValue(true);

    (Papa.parse as jest.Mock).mockImplementationOnce((_, options: any) => {
      options.complete({
        data: [
          {
            Date: "2023-01-01",
            Description: "Test Transaction",
            Amount: "100",
            Currency: "USD",
          },
        ],
        errors: [],
      });
    });

    const result = await uploadTransactionService(buffer);

    expect(result).toEqual({
      message: "File processed successfully",
      transactionsSaved: 1,
      duplicates: [],
      schemaErrors: [],
    });
    expect(mockEm.persist).toHaveBeenCalledTimes(1);
    expect(mockEm.flush).toHaveBeenCalledTimes(1);
  });

  it("should handle invalid date format in the CSV", async () => {
    const csvContent = `
          Date,Description,Amount,Currency
          invalid-date,Test Transaction,100,USD
        `;
    const buffer = Buffer.from(csvContent, "utf-8");

    // Mock the persist and flush behavior to avoid unexpected calls
    const mockPersist = jest.fn().mockReturnThis();
    mockEm.persist = mockPersist;
    mockEm.flush = jest.fn().mockResolvedValue(undefined);

    // Mock date-fns validation to return false for invalid date
    jest.requireMock("date-fns").isValid.mockReturnValue(false);

    // Mock Papa.parse for invalid date
    (Papa.parse as jest.Mock).mockImplementationOnce((_, options: any) => {
      options.complete({
        data: [
          {
            Date: "invalid-date",
            Description: "Test Transaction",
            Amount: "100",
            Currency: "USD",
          },
        ],
        errors: [],
      });
    });

    const result = await uploadTransactionService(buffer);

    expect(result).toEqual({
      message: "Empty file",
      transactionsSaved: 0,
      duplicates: [],
      schemaErrors: [
        {
          row: {
            Date: "invalid-date",
            Description: "Test Transaction",
            Amount: "100",
            Currency: "USD",
          },
          message: "Invalid date format",
        },
      ],
    });

    // Ensure no persist or flush calls are made
    expect(mockEm.persist).not.toHaveBeenCalled();
    expect(mockEm.flush).not.toHaveBeenCalled();
  });

  it("should detect and track file-level duplicates", async () => {
    const csvContent = `
        Date,Description,Amount,Currency
        01-01-2023,Test Transaction,100,USD
        01-01-2023,Test Transaction,100,USD
      `;
    const buffer = Buffer.from(csvContent, "utf-8");

    // Mock the persist and flush behavior to avoid unexpected calls
    const mockPersist = jest.fn().mockReturnThis();
    mockEm.persist = mockPersist;
    mockEm.flush = jest.fn().mockResolvedValue(undefined);

    jest.requireMock("date-fns").isValid.mockReturnValue(true);
    // Mock Papa.parse for file-level duplicates
    (Papa.parse as jest.Mock).mockImplementationOnce((_, options: any) => {
      options.complete({
        data: [
          {
            Date: "01-01-2023",
            Description: "Test Transaction",
            Amount: "100",
            Currency: "USD",
          },
          {
            Date: "01-01-2023",
            Description: "Test Transaction",
            Amount: "100",
            Currency: "USD",
          },
        ],
        errors: [],
      });
    });

    const result = await uploadTransactionService(buffer);

    expect(result).toEqual({
      message: "File processed successfully",
      transactionsSaved: 1,
      duplicates: [
        {
          Date: "01-01-2023",
          Description: "Test Transaction",
          Amount: "100",
          Currency: "USD",
        },
      ],
      schemaErrors: [],
    });
    expect(mockEm.persist).toHaveBeenCalledTimes(1);
    expect(mockEm.flush).toHaveBeenCalledTimes(1);
  });

  it("should detect database-level duplicates", async () => {
    const csvContent = `
        Date,Description,Amount,Currency
        01-01-2023,Test Transaction,100,USD
      `;
    const buffer = Buffer.from(csvContent, "utf-8");

    // Mock the persist and flush behavior to avoid unexpected calls
    const mockPersist = jest.fn().mockReturnThis();
    mockEm.persist = mockPersist;
    mockEm.flush = jest.fn().mockResolvedValue(undefined);

    mockEm.findOne.mockResolvedValue(new Transctions()); // Simulate a database duplicate
    jest.requireMock("date-fns").isValid.mockReturnValue(true);

    // Mock Papa.parse for database-level duplicates
    (Papa.parse as jest.Mock).mockImplementationOnce((_, options: any) => {
      options.complete({
        data: [
          {
            Date: "01-01-2023",
            Description: "Test Transaction",
            Amount: "100",
            Currency: "USD",
          },
        ],
        errors: [],
      });
    });

    const result = await uploadTransactionService(buffer);

    expect(result).toEqual({
      message: "Empty file",
      transactionsSaved: 0,
      duplicates: [
        {
          Date: "01-01-2023",
          Description: "Test Transaction",
          Amount: "100",
          Currency: "USD",
        },
      ],
      schemaErrors: [],
    });
    expect(mockEm.persist).not.toHaveBeenCalled();
    expect(mockEm.flush).not.toHaveBeenCalled();
  });

  it("should handle a CSV with schema errors (missing fields)", async () => {
    const csvContent = `
        Date,Description,Amount,Currency
        01-01-2023,,100,USD
      `;
    const buffer = Buffer.from(csvContent, "utf-8");

    // Mock the persist and flush behavior to avoid unexpected calls
    const mockPersist = jest.fn().mockReturnThis();
    mockEm.persist = mockPersist;
    mockEm.flush = jest.fn().mockResolvedValue(undefined);

    jest.requireMock("date-fns").isValid.mockReturnValue(true);

    // Mock Papa.parse for missing fields
    (Papa.parse as jest.Mock).mockImplementationOnce((_, options: any) => {
      options.complete({
        data: [
          {
            Date: "01-01-2023",
            Description: "",
            Amount: "100",
            Currency: "USD",
          },
        ],
        errors: [],
      });
    });

    const result = await uploadTransactionService(buffer);

    expect(result).toEqual({
      message: "Empty file",
      transactionsSaved: 0,
      duplicates: [],
      schemaErrors: [
        {
          row: {
            Date: "01-01-2023",
            Description: "",
            Amount: "100",
            Currency: "USD",
          },
          message:
            "Invalid schema: Missing required fields empty description/currency, or invalid amount",
        },
      ],
    });
    expect(mockEm.persist).not.toHaveBeenCalled();
    expect(mockEm.flush).not.toHaveBeenCalled();
  });

  it("should remove Byte Order Mark (BOM) if present", async () => {
    const csvContentWithBOM =
      "\ufeffDate,Description,Amount,Currency\n01-01-2023,Test Transaction,100,USD";
    const csvContentWithoutBOM =
      "Date,Description,Amount,Currency\n01-01-2023,Test Transaction,100,USD";

    const bufferWithBOM = Buffer.from(csvContentWithBOM, "utf-8");
    const bufferWithoutBOM = Buffer.from(csvContentWithoutBOM, "utf-8");

    mockEm.findOne.mockResolvedValue(null); // No duplicates in the database

    const mockPersist = jest.fn().mockReturnThis(); // Make `persist` chainable
    mockEm.persist = mockPersist;
    mockEm.flush = jest.fn().mockResolvedValue(undefined); // Ensure `flush` resolves without errors

    jest.requireMock("date-fns").isValid.mockReturnValue(true);

    // Mock Papa.parse for buffer with BOM
    (Papa.parse as jest.Mock).mockImplementationOnce((_, options: any) => {
      options.complete({
        data: [
          {
            Date: "01-01-2023",
            Description: "Test Transaction",
            Amount: "100",
            Currency: "USD",
          },
        ],
        errors: [],
      });
    });

    // Mock Papa.parse for buffer without BOM
    (Papa.parse as jest.Mock).mockImplementationOnce((_, options: any) => {
      options.complete({
        data: [
          {
            Date: "01-01-2023",
            Description: "Test Transaction",
            Amount: "100",
            Currency: "USD",
          },
        ],
        errors: [],
      });
    });

    try {
      const resultWithBOM = await uploadTransactionService(bufferWithBOM);
      const resultWithoutBOM = await uploadTransactionService(bufferWithoutBOM);

      // Expect the results to be the same whether BOM is present or not
      expect(resultWithBOM).toEqual({
        message: "File processed successfully",
        transactionsSaved: 1,
        duplicates: [],
        schemaErrors: [],
      });

      expect(resultWithoutBOM).toEqual({
        message: "File processed successfully",
        transactionsSaved: 1,
        duplicates: [],
        schemaErrors: [],
      });

      expect(mockEm.persist).toHaveBeenCalledTimes(2);
      expect(mockEm.flush).toHaveBeenCalledTimes(2);
    } catch (error) {
      throw error; // Re-throw the error to ensure the test fails
    }
  });

  it("should throw an error if database connection fails", async () => {
    (connectDB as jest.Mock).mockResolvedValue(null);

    const buffer = Buffer.from("", "utf-8");

    await expect(uploadTransactionService(buffer)).rejects.toThrow(
      "Database connection failed"
    );
  });

  it("should handle CSV parsing errors", async () => {
    const buffer = Buffer.from("", "utf-8");

    // Mock the behavior of Papa.parse to simulate an error
    (Papa.parse as jest.Mock).mockImplementationOnce((_, options: any) => {
      options.error(new Error("Parsing error"));
    });

    await expect(uploadTransactionService(buffer)).rejects.toThrow(
      "Failed to parse file: Parsing error"
    );
  });
});
