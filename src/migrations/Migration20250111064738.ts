import { Migration } from '@mikro-orm/migrations';

export class Migration20250111064738 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "transction" ("id" serial primary key, "date" timestamptz not null, "description" text not null default '', "amount" real not null, "currency" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "is_deleted" boolean not null default false);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "transction" cascade;`);
  }

}
