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

const mikroOrmConfig: Options = {
  driver: PostgreSqlDriver,
  migrations: {
    path: path.join(path.resolve(), "src/migrations"), // Path to store migration files
  },
  entities: [Transctions], // Entities representing the database schema (models)
  clientUrl: connectionString, // Database connection string
  debug: false, // Enabled only in development mode to observe the SQL queries generated for the defined entities
  logger: (message: string) => {}, // Disable logging
  // driverOptions: {
  //   connection: {
  //     ssl: {
  //       // ca: sslCert,
  //       rejectUnauthorized: false,
  //     },
  //     connectionTimeoutMillis: 2000, // Timeout in milliseconds for a connection attempt
  //   },
  // },
  // pool: {
  //   min: 2, // Minimum number of connections in the pool
  //   max: 20, // Maximum number of connections in the pool
  //   idleTimeoutMillis: 15000, // Time in milliseconds before idle connections are closed
  // },
  driverOptions: {
    connection: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
};

export default mikroOrmConfig;
