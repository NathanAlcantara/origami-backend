import { Field, InputType } from "type-graphql";
import { TConstructor } from "utils";

import { CPFValidation } from "@validations/cpfValidation";

export const MixinCPFWith = <TClass extends TConstructor>(
  AdditionalClass: TClass
) => {
  @InputType({ isAbstract: true })
  class CPF extends AdditionalClass {
    @Field({ nullable: true })
    @CPFValidation()
    cpf?: string;
  }

  return CPF;
};
