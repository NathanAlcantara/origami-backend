import { IsDate, IsUUID, ValidateNested } from "class-validator";
import { GraphQLUUID } from "graphql-custom-types";
import { Field, InputType } from "type-graphql";

@InputType()
class CreatedAtRageInput {
  @Field()
  @IsDate()
  start: Date;

  @Field()
  @IsDate()
  end: Date;
}

export const IdInput = (required = false) => {
  @InputType({ isAbstract: true })
  class IdInputClass {
    @Field(() => GraphQLUUID, { nullable: !required })
    @IsUUID()
    id: string;
  }

  return IdInputClass;
};

@InputType()
export class RequiredIdInput extends IdInput(true) {}

export const AuditInput = () => {
  @InputType({ isAbstract: true })
  class AuditInputClass extends IdInput() {
    @Field(() => CreatedAtRageInput, { nullable: true })
    @ValidateNested()
    createdAtRange?: CreatedAtRageInput;
  }

  return AuditInputClass;
};
