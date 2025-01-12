import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "transction" })
export class Transctions {
  @PrimaryKey({ type: "serial" })
  id!: number;

  @Property({ type: "timestamp" })
  Date!: Date;

  @Property({ type: "text" })
  Description = "";

  @Property({ type: "float" })
  Amount!: number;

  @Property({ type: "string" })
  Currency!: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt!: Date;

  @Property({ default: false })
  isDeleted!: boolean;
}
