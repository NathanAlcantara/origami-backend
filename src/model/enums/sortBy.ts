import { registerEnumType } from "type-graphql";

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

registerEnumType(SortOrder, { name: "SortOrder" });