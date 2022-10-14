import { GraphQLUUID } from "graphql-custom-types";
import { Field, ObjectType } from "type-graphql";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { getLoggedUser } from "utils";

@ObjectType()
export class Audit {
  @Field(() => GraphQLUUID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  createdBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  updatedBy: string;

  @BeforeInsert()
  async beforeInsert() {
    const user = await getLoggedUser();
    this.createdBy = user.email;
    this.updatedBy = user.email;
  }

  @BeforeUpdate()
  async beforeUpdate() {
    const user = await getLoggedUser();
    this.updatedBy = user.email;
  }
}
