import { connectDB } from "../../src/data/database";
import { Transctions } from "../../src/entities/Transctions";
import { deleteRowsService } from "../../src/services/deleteRowsService";

// Mock the `connectDB` function
jest.mock("../../src/data/database", () => ({
  connectDB: jest.fn(),
}));

describe("deleteRowsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete all rows from the Transctions table", async () => {
    const mockFork = {
      nativeDelete: jest.fn().mockResolvedValue(undefined),
    };

    const mockOrm = {
      em: { fork: jest.fn().mockReturnValue(mockFork) },
    };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);

    await deleteRowsService();

    expect(mockFork.nativeDelete).toHaveBeenCalledWith(Transctions, {});
  });

  it("should handle errors thrown by nativeDelete gracefully", async () => {
    const mockFork = {
      nativeDelete: jest
        .fn()
        .mockRejectedValue(new Error("Database deletion failed")),
    };

    const mockOrm = {
      em: { fork: jest.fn().mockReturnValue(mockFork) },
    };

    (connectDB as jest.Mock).mockResolvedValue(mockOrm);

    await expect(deleteRowsService()).rejects.toThrow(
      "Database deletion failed"
    );

    expect(mockFork.nativeDelete).toHaveBeenCalledWith(Transctions, {});
  });
});
