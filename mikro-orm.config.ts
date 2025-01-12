import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Options } from "@mikro-orm/core";
import { Transctions } from "./src/entities/Transctions";

const mikroOrmConfig: Options<PostgreSqlDriver> = {
  driver: PostgreSqlDriver,
  migrations: {
    path: "./src/migrations", // Path to store migration files
  },
  entities: [Transctions], // Entities representing the database schema (models)
  clientUrl: "postgres://postgres:123456@localhost:5432/moneymapdb",
  debug: process.env.NODE_ENV === "development", // Enabled only in development mode to observe the SQL queries generated for the defined entities
};

export default mikroOrmConfig;
