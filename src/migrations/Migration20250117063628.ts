import { Migration } from '@mikro-orm/migrations';

export class Migration20250117063628 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "transction" drop constraint "transction_date_description_unique";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "transction" add constraint "transction_date_description_unique" unique ("date", "description");`);
  }

}
