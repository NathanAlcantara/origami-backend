import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { Audit } from "./audit";
import { User } from "./user";

@ObjectType()
@Entity()
export class Notification extends Audit {
  @Field()
  @Column()
  message: string;

  @Field()
  @Column({ default: false })
  read: boolean;

  @Field()
  @Column()
  link: string;

  @ManyToOne(() => User, (user) => user.notification, { onDelete: "CASCADE" })
  user: User;
}
