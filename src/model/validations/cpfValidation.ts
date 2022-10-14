import { registerDecorator, ValidationOptions } from "class-validator";
import { cpf } from "cpf-cnpj-validator";

export function CPFValidation(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(text: string) {
          return cpf.isValid(text);
        },
        defaultMessage() {
          return "CPF is not valid";
        },
      },
    });
  };
}
