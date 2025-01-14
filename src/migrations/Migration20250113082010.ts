import { Migration } from '@mikro-orm/migrations';

export class Migration20250113082010 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "transction" alter column "description" drop default;`);
    this.addSql(`alter table "transction" alter column "description" type text using ("description"::text);`);
    this.addSql(`alter table "transction" add constraint "transction_date_description_unique" unique ("date", "description");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "transction" drop constraint "transction_date_description_unique";`);

    this.addSql(`alter table "transction" alter column "description" type text using ("description"::text);`);
    this.addSql(`alter table "transction" alter column "description" set default '';`);
  }

}
