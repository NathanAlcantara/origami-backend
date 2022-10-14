import { ClassType } from "type-graphql";
import { BaseEntity } from "typeorm";

import { Role } from "src/model/enums/role";

class AuthorizedRole {
  get: [Role]
  insert: [Role]
  update: [Role]
  delete: [Role]
  list: [Role]
}

export interface BaseResolverOptions<TEntity extends ClassType<BaseEntity>> {
  entity: TEntity;
  insertInput?: ClassType;
  updateInput?: ClassType;
  listInput?: ClassType;
  findRelations?: string[];
  pluralWithEs?: boolean;
  authorizedRole?: AuthorizedRole;
}