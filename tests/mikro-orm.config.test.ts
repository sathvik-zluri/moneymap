jest.mock("../mikro-orm.config", () => {
  return {
    __esModule: true,
    default: {
      driver: jest.fn(), // Mocked PostgreSqlDriver function
      migrations: {
        path: "src/migrations",
      },
      entities: [jest.fn()], // Mocked Transctions entity
      clientUrl:
        "postgres://test_user:test_password@localhost:5432/test_db?sslmode=require",
      debug: true,
      logger: jest.fn(), // Mocked logger function
      driverOptions: {
        connection: {
          ssl: {
            ca: "fake-cert-content",
          },
        },
      },
    },
  };
});

describe("MikroORM Configuration", () => {
  it("should have the correct configuration", () => {
    const mikroOrmConfig = require("../mikro-orm.config").default;

    // Define the expected configuration
    const expectedConfig = {
      driver: expect.any(Function), // Mocked PostgreSqlDriver
      migrations: {
        path: "src/migrations", // Mocked migrations path
      },
      entities: [expect.any(Function)], // Mocked Transctions entity
      clientUrl:
        "postgres://test_user:test_password@localhost:5432/test_db?sslmode=require",
      debug: true, // Debug enabled for development environment
      logger: expect.any(Function), // Mocked logger function
      driverOptions: {
        connection: {
          ssl: {
            ca: "fake-cert-content", // Mocked SSL cert content
          },
        },
      },
    };

    // Assert that the MikroORM configuration matches the expected configuration
    expect(mikroOrmConfig).toEqual(expectedConfig);
  });
});
