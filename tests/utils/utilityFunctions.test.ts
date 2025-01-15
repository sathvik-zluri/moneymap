import { isValid } from "date-fns";
import { createUniqueKey, parseDate } from "../../src/utils/utilityFunctions";

// Mock `isValid` from `date-fns` for the test
jest.mock("date-fns", () => ({
  isValid: jest.fn(),
}));

describe("Utility Functions", () => {
  // Tests for parseDate function
  describe("parseDate", () => {
    it("should return a valid Date object for a valid date string", () => {
      const rawDate = "15-12-2025"; // dd-mm-yyyy format
      const expectedDate = new Date("2025-12-15"); // The expected Date object

      // Mock isValid to return true for valid date
      (isValid as jest.Mock).mockReturnValue(true);

      const result = parseDate(rawDate);
      expect(result).toEqual(expectedDate);
      expect(isValid).toHaveBeenCalledWith(expectedDate);
    });

    it("should return null for an invalid date string", () => {
      const rawDate = "invalid-date";

      // Mock isValid to return false for invalid date
      (isValid as jest.Mock).mockReturnValue(false);

      const result = parseDate(rawDate);
      expect(result).toBeNull();
      expect(isValid).toHaveBeenCalled();
    });

    it("should return null for an empty date string", () => {
      const rawDate = "";

      const result = parseDate(rawDate);
      expect(result).toBeNull();
    });

    it("should return null for null input", () => {
      const rawDate: string | null = null;

      const result = parseDate(rawDate);
      expect(result).toBeNull();
    });
  });

  // Tests for createUniqueKey function
  describe("createUniqueKey", () => {
    it("should return a unique key based on date and description", () => {
      const date = "2025-12-15";
      const description = "Test Transaction";

      const result = createUniqueKey(date, description);
      const expectedKey = "2025-12-15-Test Transaction";
      expect(result).toBe(expectedKey);
    });

    it("should correctly create unique keys for different descriptions", () => {
      const date = "2025-12-15";
      const description1 = "Test Transaction";
      const description2 = "Another Transaction";

      const key1 = createUniqueKey(date, description1);
      const key2 = createUniqueKey(date, description2);

      expect(key1).not.toBe(key2);
    });
  });
});
