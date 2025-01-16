import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Options } from "@mikro-orm/core";
import { Transctions } from "./src/entities/Transctions";
import path from "path";
import { config } from "dotenv";
import fs from "fs";

config({
  path: path.join(path.resolve(), ".env"),
});

const DataBase = process.env.PG_DATABASE;
const UserName = process.env.PG_USER;
const Password = process.env.PG_PASSWORD;
const Host = process.env.PG_HOST;
const Port = process.env.PG_PORT;
const sslCert = process.env.PG_SSL_CA;

const connectionString: string = `postgres://${UserName}:${Password}@${Host}:${Port}/${DataBase}?sslmode=require`;

const mikroOrmConfig: Options<PostgreSqlDriver> = {
  driver: PostgreSqlDriver,
  migrations: {
    path: path.join(path.resolve(), "src/migrations"), // Path to store migration files
  },
  entities: [Transctions], // Entities representing the database schema (models)
  clientUrl: connectionString, // Database connection string
  debug: process.env.NODE_ENV === "development", // Enabled only in development mode to observe the SQL queries generated for the defined entities
  logger: (message: string) => {}, // Disable logging
  driverOptions: {
    connection: {
      ssl: {
        ca: fs.readFileSync(sslCert || ""),
      },
    },
  },
};

export default mikroOrmConfig;