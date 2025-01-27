import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { convertCurrency } from "../../src/utils/exchangeRate";

// Mock axios
jest.mock("axios");

const createAxiosError = (status: number, res: AxiosResponse): AxiosError => {
  const err = new AxiosError(
    "Error",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    res // Pass the full AxiosResponse here
  );
  err.status = status;
  return err;
};

describe("convertCurrency", () => {
  // Mock console.error to capture the log
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore console.error after each test
  });

  it("should return the correct converted amount in INR", async () => {
    // Arrange
    const date = "2025-01-01";
    const currency = "USD";
    const amount = 100;

    // Mock the axios response
    const mockResponse = { data: { rate: 75 } }; // Assuming 1 USD = 75 INR
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    // Act
    const result = await convertCurrency(date, currency, amount);

    // Assert
    expect(result).toEqual({ amountInr: 7500 });
  });

  it("should handle AxiosErrorCurrency when currency conversion fails", async () => {
    const date = "2025-01-21";
    const currency = "USD";
    const amount = 100;

    // Create the full mock response that matches AxiosResponse
    const mockResponse: AxiosResponse = {
      data: { error: "Invalid currency" },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    // Create the AxiosError with the full response object
    const mockError = createAxiosError(400, mockResponse);

    // Mock the axios call to reject with the mock error
    (axios.get as jest.Mock).mockRejectedValue(mockError);

    // Act and Assert
    try {
      await convertCurrency(date, currency, amount);
    } catch (error) {
      // Expect the error to be structured as AxiosErrorCurrency
      expect(error).toEqual({
        name: "AxiosErrorCurrency",
        statusCode: 400,
        message: "Invalid currency",
      });

      // Test console.error to ensure the error message is logged
      expect(console.error).toHaveBeenCalledWith(
        "AxiosError: Invalid currency (status: 400)"
      );
    }
  });
  it("should throw a structured error if there is a network or unexpected error", async () => {
    const date = "2025-01-01";
    const currency = "USD";
    const amount = 100;

    // Mock the axios error for network issue
    const mockError = new Error("Network Error");
    (axios.get as jest.Mock).mockRejectedValue(mockError);

    // Act and Assert
    try {
      await convertCurrency(date, currency, amount);
    } catch (error) {
      expect(error).toEqual(
        new Error("Unexpected error occurred during currency conversion")
      );
    }
  });
});
