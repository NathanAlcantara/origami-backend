import { NonEmptyArray } from "type-graphql";
import { NotificationResolver } from "./notificationResolver";
import { UserResolver } from "./userResolver";

export const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  NotificationResolver,
  UserResolver,
];

export default resolvers;
