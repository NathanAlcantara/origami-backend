import { Role } from "@enums/role";
import { CPFValidation } from "@validations/cpfValidation";
import { IsEmail, Length } from "class-validator";
import { GraphQLEmail } from "graphql-custom-types";
import { GraphQLJSONObject } from "graphql-type-json";
import { randomPassword } from "secure-random-password";
import { Field, ObjectType } from "type-graphql";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import { EncryptionTransformer } from "typeorm-encrypted";
import { isNotValid } from "utils";
import { Audit } from "./audit";
import { Notification } from "./notification";

@ObjectType()
@Entity()
export class User extends Audit {
  @Field()
  @Column()
  name: string;

  @Field(() => GraphQLEmail)
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field({ nullable: false })
  @Column({ nullable: false, unique: true, length: 11 })
  @Length(11, 11)
  @CPFValidation()
  cpf: string;

  @Field(() => Role)
  @Column({ type: "enum", enum: Role })
  role: Role;

  @Column({
    transformer: new EncryptionTransformer({
      key: "e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61",
      algorithm: "aes-256-cbc",
      ivLength: 16,
      iv: "ff5ac19190424b1d88f9419ef949ae56",
    }),
  })
  password: string;

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
  })
  notification: Notification[];

  @Field(() => GraphQLJSONObject, { simple: true, nullable: true })
  @Column({ type: "json", nullable: true })
  customization: object;

  @BeforeInsert()
  async beforeInsertUser() {
    this.password = randomPassword();
  }

  @BeforeUpdate()
  async beforeUpdateUser() {
    if (isNotValid(this.password)) {
      this.password = randomPassword();
    }
  }
}
