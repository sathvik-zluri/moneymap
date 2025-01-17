import { Migration } from "@mikro-orm/migrations";

export class Migration20250116165710 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "transction" alter column "amount" type numeric(15,2) using ("amount"::numeric(15,2));`
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "transction" alter column "amount" type real using ("amount"::real);`
    );
  }
}
