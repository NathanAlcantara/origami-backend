import { BasePaginationArgs } from "@args/paginationArgs";
import { Role } from "@enums/role";
import { SortOrder } from "@enums/sortBy";
import { BaseResolverOptions } from "@interfaces/baseResolverOptions";
import { BasePaginatedOutput } from "@outputs/paginationOutput";
import { camelCase } from "lodash";
import {
  Args,
  ArgsType,
  Authorized,
  ClassType,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { BaseEntity, getRepository, Repository } from "typeorm";
import { isNotValid, isValid } from "utils";

export const BaseListResolver = <TEntity extends ClassType<BaseEntity>>({
  entity,
  listInput,
  findRelations,
  pluralWithEs,
  authorizedRole,
}: BaseResolverOptions<TEntity>) => {
  @ObjectType(`Paginated${entity.name}Output`)
  class PaginatedOutput extends BasePaginatedOutput(entity) {}

  @ArgsType()
  class PaginationArgs extends BasePaginationArgs(listInput, findRelations) {}

  @Resolver({ isAbstract: true })
  class BaseListResolverClass {
    paginationArgs: PaginationArgs;
    entityRepository: Repository<TEntity | any>;

    constructor() {
      this.entityRepository = getRepository<TEntity>(entity);
    }

    @Authorized(authorizedRole.list)
    @Query(() => PaginatedOutput, {
      name: `${camelCase(entity.name)}${pluralWithEs ? "es" : "s"}`,
    })
    async getAll(
      @Args() paginationArgs: PaginationArgs
    ): Promise<PaginatedOutput> {
      paginationArgs = await this.beforeSearch(paginationArgs);

      const { search, skip, itemsPerPage, order, relations } = paginationArgs;

      const entityName = entity.name.toLowerCase();

      const entitiesTupleQuery =
        this.entityRepository.createQueryBuilder(entityName);

      if (relations) {
        relations.forEach((relation) => {
          entitiesTupleQuery.leftJoinAndSelect(
            `${entityName}.${relation}`,
            relation
          );
        });
      }

      if (search) {
        const where = convertSearch(entityName, search);

        if (where) {
          entitiesTupleQuery.where(where.string, where.params);
        }
      }

      entitiesTupleQuery.skip(skip).take(itemsPerPage);

      if (order) {
        const orderBy = convertOrderBy(entityName, order);

        entitiesTupleQuery.orderBy(orderBy);
      }

      const entitiesTuple = await entitiesTupleQuery.getManyAndCount();

      return {
        items: entitiesTuple[0],
        total: entitiesTuple[1],
      };
    }

    async beforeSearch(args: PaginationArgs): Promise<PaginationArgs> {
      return args;
    }
  }

  return BaseListResolverClass;
};

const convertOrderBy = (
  entityName: string,
  order: any
): { [columnName: string]: SortOrder } => {
  let orderBy = {};

  Object.entries(order).forEach(([key, value]) => {
    const orderByName = key.includes(".") ? key : `${entityName}.${key}`;

    orderBy = { ...orderBy, ...{ [orderByName]: value } };
  });

  return orderBy;
};

const convertSearch = (
  entityName: string,
  entity: any
): { string: string; params: any } => {
  let json = {};

  const createJSONQuery = (key, value, isArray = false) => {
    switch (typeof value) {
      case "object":
        if (value.length) {
          Object.values(value).forEach((val) => {
            createJSONQuery(key, val, true);
          });
        } else {
          Object.entries(value).forEach(([k, v]) => {
            const kay = `${key}.${k}`;

            if (
              !isArray &&
              (kay.includes("id") ||
                Array.isArray(v) ||
                Object.prototype.toString.call(v) === "[object Date]")
            ) {
              json = { ...json, ...{ [kay]: v } };
            } else {
              if (isValid(json[kay])) {
                json[kay] = [...json[kay], ...[v]];
              } else {
                json = { ...json, ...{ [kay]: [v] } };
              }
            }
          });
        }
        break;
      default:
        if (isArray) {
          const oldValue = json[`${entityName}.${key}`];
          if (oldValue) {
            if (typeof oldValue === "object") {
              value = [...oldValue, ...[value]];
            } else {
              value = [...[oldValue], ...[value]];
            }
          }
        }

        json = { ...json, ...{ [`${entityName}.${key}`]: value } };
        break;
    }
  };

  Object.entries(entity).forEach((entry) => {
    const key = entry[0];
    const value: any = entry[1];

    createJSONQuery(key, value);
  });

  let whereParams = {};
  const whereArray: string[] = [];

  Object.entries(json).forEach(([key, value]) => {
    const jsonKey = key.split(".").join("");

    if (key.includes("AtRange")) {
      const k = key.split("Range.");
      if (k[1] === "start") {
        whereArray.push(`${k[0]} >= :${jsonKey}`);
      } else {
        whereArray.push(`${k[0]} <= :${jsonKey}`);
      }
    } else if (
      !Array.isArray(value) &&
      (key.includes("id") || key.includes("By"))
    ) {
      whereArray.push(`${key} = :${jsonKey}`);
    } else {
      const nullIndex = Array.isArray(value)
        ? value.findIndex((val) => val.includes("NULL"))
        : -1;

      let whereString = "";

      switch (typeof value) {
        case "string":
          if (value.includes(",")) {
            whereString = `${key} in (:...${jsonKey})`;
          } else if (
            value === value.toUpperCase() &&
            isNotValid(Number(value))
          ) {
            whereString = `${key} = :${jsonKey}`;
          } else {
            whereString = `${key} ILIKE :${jsonKey}`;
            value = `%${value}%`;
          }
          break;
        case "boolean":
          whereString = `${key} = :${jsonKey}`;
          break;
        default:
          if (nullIndex >= 0) {
            whereString = `${key} IS NULL`;
            (value as any[]).splice(nullIndex, 1);

            if ((value as any[]).length) {
              whereString = `(${whereString} or ${key} in (:...${jsonKey}))`;
            }
          } else {
            whereString = `${key} in (:...${jsonKey})`;
          }
          break;
      }

      whereArray.push(whereString);
    }

    whereParams = { ...whereParams, ...{ [jsonKey]: value } };
  });

  const whereString = whereArray.join(" and ");

  return { string: whereString, params: whereParams };
};
