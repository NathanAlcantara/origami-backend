import { Role } from "@enums/role";
import { BaseResolverOptions } from "@interfaces/baseResolverOptions";
import { GraphQLUUID } from "graphql-custom-types";
import { camelCase } from "lodash";
import {
  Arg,
  Authorized,
  ClassType,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { BaseEntity } from "typeorm";
import { isNotValid } from "utils";
import { BaseListResolver } from "./listResolver";

export const BaseResolver = <TEntity extends ClassType<BaseEntity>>(
  options: BaseResolverOptions<TEntity>
) => {
  const {
    entity,
    insertInput,
    updateInput,
    authorizedRole,
  } = options;

  @InputType(`${entity.name}InsertInput`, { isAbstract: true })
  class InsertInput extends insertInput {}

  @InputType(`${entity.name}UpdateInput`, { isAbstract: true })
  class UpdateInput extends updateInput {}

  const ListResolver = BaseListResolver(options);

  @Resolver({ isAbstract: true })
  class BaseResolverClass extends ListResolver {
    constructor() {
      super();
    }

    @Authorized(authorizedRole.get)
    @Query(() => entity, { name: `${camelCase(entity.name)}`, nullable: true })
    entity(
      @Arg("id", () => GraphQLUUID) id: string
    ): Promise<TEntity | undefined> {
      return this.getById(id);
    }

    @Authorized(authorizedRole.insert)
    @Mutation(() => entity, { name: `insert${entity.name}` })
    async insert(
      @Arg("data", () => insertInput) data: InsertInput
    ): Promise<TEntity> {
      const entityData = await this.entityRepository.insert(data);

      const entity = entityData.raw[0];

      return entity;
    }

    @Authorized(authorizedRole.update)
    @Mutation(() => entity, { name: `update${entity.name}` })
    async update(
      @Arg("id", () => GraphQLUUID) id: string,
      @Arg("data", () => updateInput) data: UpdateInput
    ): Promise<TEntity> {
      const entityData = await this.entityRepository.update(id, data);

      const entity = entityData.raw[0];

      return entity;
    }

    @Authorized(authorizedRole.delete)
    @Mutation(() => Boolean, { name: `delete${entity.name}` })
    async delete(@Arg("id", () => GraphQLUUID) id: string): Promise<Boolean> {
      const entityData = await this.getById(id);
      const results = await this.entityRepository.remove(entityData);

      if (results.length) {
        return results.some((result) => isNotValid(result.id));
      }

      return isNotValid(results.id);
    }

    getById(id: string): Promise<TEntity | undefined> {
      return this.entityRepository.findOneOrFail(id);
    }
  }

  return BaseResolverClass;
};
