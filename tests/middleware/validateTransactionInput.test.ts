import { connectDB } from "../../src/data/database";
import { validateTransactionInput } from "../../src/middleware/validateTransactionInput";
import { Request, Response } from "express";

jest.mock("../../src/data/database", () => ({
  connectDB: jest.fn(),
}));

describe("validateTransactionInput Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should return 400 if required fields are missing", async () => {
    mockRequest.body = {
      Description: "Test Description",
      Amount: 100,
    }; // Missing Date and Currency

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "This field is required, This field is required",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 400 if Description is empty", async () => {
    // Case 1: Description is an empty string
    mockRequest.body = {
      Date: "2023-12-01",
      Description: "",
      Amount: 100,
      Currency: "USD",
    };

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Must be a non-empty string",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 400 if Description is undefined", async () => {
    // Case 2: Description is missing (undefined)
    mockRequest.body = {
      Date: "2023-12-01",
      Amount: 100,
      Currency: "USD",
    };

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "This field is required",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 400 if Date is invalid", async () => {
    mockRequest.body = {
      Date: "invalid-date",
      Description: "Test Description",
      Amount: 100,
      Currency: "USD",
    };

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid date format",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 400 if Amount is invalid", async () => {
    mockRequest.body = {
      Date: "2023-12-01",
      Description: "Test Description",
      Amount: -100, // Invalid Amount
      Currency: "USD",
    };

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Must be a valid positive number",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 500 if database connection fails", async () => {
    (connectDB as jest.Mock).mockResolvedValueOnce(null); // Simulate DB connection failure

    mockRequest.body = {
      Date: "2023-12-01",
      Description: "Test Description",
      Amount: 100,
      Currency: "USD",
    };

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Database connection failed",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 404 if the transaction is not found", async () => {
    (connectDB as jest.Mock).mockResolvedValueOnce({
      em: {
        fork: jest.fn().mockReturnThis(),
        findOne: jest.fn().mockResolvedValueOnce(null), // Simulate transaction not found
      },
    });

    mockRequest.body = {
      Date: "2023-12-01",
      Description: "Test Description",
      Amount: 100,
      Currency: "USD",
    };
    mockRequest.params = { id: "1" }; // Non-existent transaction ID

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Transaction not found",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 409 if duplicate transaction exists", async () => {
    // Mock the database connection and EntityManager
    (connectDB as jest.Mock).mockResolvedValueOnce({
      em: {
        fork: jest.fn().mockReturnThis(),
        findOne: jest
          .fn()
          .mockResolvedValueOnce({}) // Simulate an existing transaction with the given id
          .mockResolvedValueOnce({}), // Simulate a duplicate transaction
      },
    });

    // Mock the request object
    mockRequest.params = { id: "1" }; // Include id in request params
    mockRequest.body = {
      Date: "2023-12-01",
      Description: "Test Description",
      Amount: 100,
      Currency: "USD",
    };

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Validate the response
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message:
        "A transaction with the same date and description already exists",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
  it("should call next if validation passes and no duplicate exists", async () => {
    (connectDB as jest.Mock).mockResolvedValueOnce({
      em: {
        fork: jest.fn().mockReturnThis(),
        findOne: jest
          .fn()
          .mockResolvedValueOnce({}) // Simulate valid transaction for the ID
          .mockResolvedValueOnce(null), // Simulate no duplicate transaction
      },
    });

    mockRequest.body = {
      Date: "2023-12-01",
      Description: "Test Description",
      Amount: 100,
      Currency: "USD",
    };

    mockRequest.params = { id: "1" }; // Simulate valid params with ID

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should return 500 if an unexpected error occurs", async () => {
    (connectDB as jest.Mock).mockRejectedValueOnce(
      new Error("Unexpected error")
    );

    mockRequest.body = {
      Date: "2023-12-01",
      Description: "Test Description",
      Amount: 100,
      Currency: "USD",
    };

    await validateTransactionInput(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Server error during validation",
      error: new Error("Unexpected error"),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
