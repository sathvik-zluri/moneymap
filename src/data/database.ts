import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "../../mikro-orm.config";

let orm: MikroORM | null = null;

export const connectDB = async () => {
  if (!orm) {
    try {
      const orm = await MikroORM.init(mikroOrmConfig);
      console.log("Database connected succesfully");
      return orm;
    } catch (error) {
      console.error("📌 Could not connect to the database", error);
      throw new Error("Database initialization failed");
    }
  }
  return orm;
};
