import { Migration } from '@mikro-orm/migrations';

export class Migration20250120183835 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "transction" ("id" serial primary key, "date" timestamptz not null, "description" text not null, "amount" numeric(10,0) not null, "currency" varchar(255) not null, "amount_inr" numeric(10,0) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "is_deleted" boolean not null default false);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "transction" cascade;`);
  }

}
