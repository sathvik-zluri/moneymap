import { Migration } from '@mikro-orm/migrations';

export class Migration20250121061602 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "transction" alter column "date" type date using ("date"::date);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "transction" alter column "date" type timestamptz using ("date"::timestamptz);`);
  }

}
