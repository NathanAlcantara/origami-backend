
import { registerEnumType } from "type-graphql";

export enum Role {
  ADM = "ADM",
  USER = "USER",
}

registerEnumType(Role, { name: "Role" });