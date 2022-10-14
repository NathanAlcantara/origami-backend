import { Notification } from "@entities/notification";
import { NotificationInput } from "@inputs/notificationInput";
import { NotificationService } from "@services/notificationService";
import { GraphQLUUID } from "graphql-custom-types";
import {
  Arg,
  Authorized,
  Int,
  Mutation,
  PubSub,
  PubSubEngine,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { Service } from "typedi";
import { getLoggedUser } from "utils";
import { BaseListResolver } from "./listResolver";

const BaseNotificationResolver = BaseListResolver({
  //TODO: AA
  entity: Notification as any,
  listInput: NotificationInput,
  findRelations: ["user"],
});

@Service()
@Resolver(() => Notification)
export class NotificationResolver extends BaseNotificationResolver {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  @Subscription(() => Int, {
    topics: ({ args }) => `${args.userId}-unreadNotificationCount`,
  })
  unreadNotificationCount(
    @Arg("userId", () => GraphQLUUID) userId: string,
    @Root() unreadNotificationCount: number
  ): number {
    return unreadNotificationCount;
  }

  @Subscription(() => Boolean, {
    topics: ({ args }) => `${args.userId}-hasNewNotification`,
  })
  hasNewNotification(
    @Arg("userId", () => GraphQLUUID) userId: string,
    @Root() hasNewNotification: boolean
  ): boolean {
    return hasNewNotification;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async changeReadNotification(
    @PubSub() pubSub: PubSubEngine,
    @Arg("notificationsIds", () => [GraphQLUUID]) notificationsIds: string[],
    @Arg("read") read: boolean
  ): Promise<boolean> {
    const loggedUser = await getLoggedUser();

    const notifications = [];

    for (const notificationId of notificationsIds) {
      const notification: Notification =
        await this.entityRepository.findOneOrFail(notificationId);

      if (loggedUser.id !== notification.user.id) {
        throw new Error(
          "Access denied! You need to be authorized to perform this action!"
        );
      }

      notification.read = read;

      notifications.push(notification);
    }

    await this.entityRepository.save(notifications);

    await this.notificationService.publishUnreadNotificationCount(
      pubSub,
      loggedUser.id
    );

    return true;
  }

  async beforeSearch(paginationArgs) {
    const loggedUser = await getLoggedUser();

    const search: any = { user: { id: loggedUser.id } };

    paginationArgs.q = { ...paginationArgs.q, ...search };

    return paginationArgs;
  }
}
