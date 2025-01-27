import { validateTransactionInput } from "../../src/middleware/validateTransactionInput";
import { Request, Response, NextFunction } from "express";

describe("validateTransactionInput", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should call next if validation passes", () => {
    mockReq.body = {
      Date: "2025-01-12",
      Description: "Valid transaction",
      Amount: 100.0,
      Currency: "USD",
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("should return validation error if Date is missing", () => {
    mockReq.body = {
      Description: "Valid transaction",
      Amount: 100.0,
      Currency: "USD",
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: ["Date is required"],
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return validation error if Date is in the future", () => {
    mockReq.body = {
      Date: "2100-01-01",
      Description: "Valid transaction",
      Amount: 100.0,
      Currency: "USD",
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: ["Date cannot be in the future"],
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return validation error if Description is empty", () => {
    mockReq.body = {
      Date: "2025-01-12",
      Description: "",
      Amount: 100.0,
      Currency: "USD",
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: ["Description cannot be empty"],
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return validation error if Description is empty after trimming", () => {
    mockReq.body = {
      Date: "2025-01-12",
      Description: "   ", // This should be trimmed and become empty
      Amount: 100.0,
      Currency: "USD",
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: ["Description cannot be empty"],
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return validation error if Description contains special characters", () => {
    // Test with a special character
    mockReq.body = {
      Date: "2025-01-12",
      Description: "Invalid description\u200B", // Contains Zero Width Space
      Amount: 100.0,
      Currency: "USD",
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: ["Invalid 'Description'. Contains special characters."],
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return trimmed Description if it passes the custom validation", () => {
    mockReq.body = {
      Date: "2025-01-12",
      Description: "  Valid description  ",
      Amount: 100.0,
      Currency: "USD",
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.body.Description).toBe("Valid description");
  });

  it("should return validation error if Amount is not a positive number", () => {
    mockReq.body = {
      Date: "2025-01-12",
      Description: "Valid transaction",
      Amount: -10,
      Currency: "USD",
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: ["Amount must be greater than 0"],
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return validation error if Currency is missing", () => {
    mockReq.body = {
      Date: "2025-01-12",
      Description: "Valid transaction",
      Amount: 100.0,
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: ["Currency is required"],
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return all validation errors if multiple fields are invalid", () => {
    mockReq.body = {
      Date: "2100-01-01", // Future date
      Description: "", // Empty description
      Amount: -10, // Negative amount
    };

    validateTransactionInput(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: [
        "Date cannot be in the future",
        "Description cannot be empty",
        "Amount must be greater than 0",
        "Currency is required",
      ],
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
