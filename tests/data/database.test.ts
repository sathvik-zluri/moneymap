import { connectDB } from "../../src/data/database";
import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import mikroOrmConfig from "../../mikro-orm.config";

describe("Database Connection", () => {
  let orm: MikroORM<PostgreSqlDriver> | undefined;
  const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

  afterAll(async () => {
    mockConsoleError.mockRestore();
    if (orm) {
      await orm.close(true);
    }
  });

  it("should connect to the database successfully", async () => {
    orm = await connectDB();

    expect(orm).toBeDefined();
    expect(orm!.isConnected()).toBeTruthy();
    expect(orm!.config.getClientUrl()).toContain(
      "postgres://postgres:123456@localhost:5432/moneymapdb"
    );
  });

  it("should handle connection errors gracefully", async () => {
    const invalidConfig = {
      ...mikroOrmConfig,
      clientUrl: "postgres://invalid:invalid@localhost:5432/invalid",
    };

    // Temporarily override MikroORM.init to simulate a failure
    jest.spyOn(MikroORM, "init").mockRejectedValueOnce(
      new Error("Authentication failed")
    );

    const result = await connectDB();
    expect(result).toBeUndefined(); // `connectDB` returns undefined on error
    expect(mockConsoleError).toHaveBeenCalledWith(
      "📌 Could not connect to the database",
      expect.any(Error) // Ensure an error object was logged
    );
  });
});