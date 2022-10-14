import { Field, InputType } from "type-graphql";
import { AuditInput, RequiredIdInput } from "./utils";

@InputType()
export class NotificationInput extends AuditInput() {
  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  read?: boolean;

  @Field({ nullable: true })
  user?: RequiredIdInput;
}
