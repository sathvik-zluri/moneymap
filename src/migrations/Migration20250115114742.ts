import { Migration } from '@mikro-orm/migrations';

export class Migration20250115114742 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "transction" ("id" serial primary key, "date" timestamptz not null, "description" text not null, "amount" real not null, "currency" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "is_deleted" boolean not null default false);`);
    this.addSql(`alter table "transction" add constraint "transction_date_description_unique" unique ("date", "description");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "transction" cascade;`);
  }

}
