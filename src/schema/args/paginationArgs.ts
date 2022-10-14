import { IsIn, Min, ValidateNested } from "class-validator";
import { ArgsType, ClassType, Field, Int } from "type-graphql";
import { FindConditions } from "typeorm";

import { SortOrder } from "src/model/enums/sortBy";

export const BasePaginationArgs = <TInput extends ClassType>(
  inputClass: TInput,
  entitiesRelations: string[]
) => {
  @ArgsType()
  abstract class PaginationArgs {
    @Field(() => inputClass, { nullable: true })
    @ValidateNested()
    q?: TInput;

    @Field(() => Int)
    @Min(0)
    page = 0;

    @Field(() => Int)
    @IsIn([10, 25, 50, 100])
    itemsPerPage = 10;

    @Field({ nullable: true })
    sortBy?: string;

    @Field(() => SortOrder)
    sortOrder = SortOrder.DESC;

    get relations(): string[] {
      return entitiesRelations;
    }

    get search(): FindConditions<TInput> {
      return this.q;
    }

    get skip(): number {
      return this.itemsPerPage * this.page;
    }

    get order(): { [x: string]: SortOrder } {
      let defaultOrder = { createdAt: SortOrder.DESC };

      if (this.sortBy) {
        defaultOrder = {
          ...{ [this.sortBy]: this.sortOrder },
          ...defaultOrder,
        };
      }

      return defaultOrder;
    }
  }
  return PaginationArgs;
};
