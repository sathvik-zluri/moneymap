import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "../../mikro-orm.config";

export const connectDB = async () => {
  try {
    const orm = await MikroORM.init(mikroOrmConfig);
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    if (migrations && migrations.length > 0) {
      await migrator.up();
    }
    console.log("Database connected succesfully");
    return orm;
  } catch (error) {
    console.error("📌 Could not connect to the database", error);
  }
};
