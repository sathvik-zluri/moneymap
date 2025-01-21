import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

/* Added Partial Index with raw Sql query 
  CREATE UNIQUE INDEX unique_transaction_not_deleted
  ON "transction" ("date", "description")
  WHERE "is_deleted" = false;
  which solves the problem of soft delete in the database
 */
@Entity({ tableName: "transction" })
export class Transctions {
  @PrimaryKey({ type: "serial" })
  id!: number;

  @Property({ type: "date" })
  Date!: Date;

  @Property({ type: "text" })
  Description!: string;

  @Property({ type: "numeric(15, 2)" })
  Amount!: number;

  @Property({ type: "string" })
  Currency!: string;

  @Property({ type: "numeric(15, 2)" })
  AmountINR!: number;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt!: Date;

  @Property({ default: false })
  isDeleted!: boolean;
}
