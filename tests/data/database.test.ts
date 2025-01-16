import { connectDB } from "../../src/data/database";
import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

describe("Database Connection", () => {
  let orm: MikroORM<PostgreSqlDriver> | undefined;
  let mockConsoleError: jest.SpyInstance;

  beforeAll(() => {
    mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("should connect to the database successfully", async () => {
    // Mock the MikroORM.init function to return a resolved ORM instance
    const mockOrm = {
      isConnected: jest.fn().mockReturnValue(true),
      config: {
        getClientUrl: jest
          .fn()
          .mockReturnValue(
            "postgres://postgres:123456@localhost:5432/moneymapdb"
          ),
      },
      close: jest.fn(),
    };

    jest.spyOn(MikroORM, "init").mockResolvedValue(mockOrm as any);

    const orm = await connectDB();

    expect(orm).toBeDefined();
    expect(orm!.isConnected()).toBeTruthy();
    expect(orm!.config.getClientUrl()).toContain(
      "postgres://postgres:123456@localhost:5432/moneymapdb"
    );
  });

  it("should handle connection errors gracefully", async () => {
    jest
      .spyOn(MikroORM, "init")
      .mockRejectedValueOnce(new Error("Authentication failed"));

    const result = await connectDB();

    // Ensure the function returns undefined when an error occurs
    expect(result).toBeUndefined();

    // Ensure console.error was called with the right error message
    expect(mockConsoleError).toHaveBeenCalledWith(
      "📌 Could not connect to the database",
      expect.any(Error) // Ensure any error object was passed
    );

    // Check the error message in the mock call
    const errorArg = mockConsoleError.mock.calls[0][1]; // Capture the error argument
    expect(errorArg.message).toBe("Authentication failed");
  });
});
