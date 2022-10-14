import { ClassType, Field, Int, ObjectType } from "type-graphql";

export const BasePaginatedOutput = <TItem>(TItemClass: ClassType<TItem>) => {
  @ObjectType({ isAbstract: true })
  abstract class BasePaginatedOutputClass {
    @Field(() => [TItemClass])
    items: TItem[];

    @Field(() => Int)
    total: number;
  }
  return BasePaginatedOutputClass;
};