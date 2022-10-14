import { HTMLTemplate } from "@coreEnum/htmlTemplate";
import { User } from "@entities/user";
import { MyContext } from "@interfaces/myContext";
import { UserCustomRepository } from "@repositories/userRepository";
import { NotificationService } from "@services/notificationService";
import { randomUUID } from "crypto";
import { FRONTEND_BASE_URL } from "envs";
import logger from "logger";
import { CacheKey, deleteCache, getCache, setCache } from "redisUtils";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { getCustomRepository } from "typeorm";
import { getLoggedUser, isNotValid } from "utils";

@Service()
@Resolver(() => User)
export class UserResolver {
  entityRepository: UserCustomRepository;
  changePasswordKey = "change-password:";

  constructor(private readonly notificationService: NotificationService) {
    this.entityRepository = getCustomRepository(UserCustomRepository);
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async me(): Promise<User | undefined> {
    const user = await getLoggedUser();
    return this.entityRepository.findOneOrFail(user.id);
  }

  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ): Promise<User | undefined> {
    const user = await this.entityRepository.findOne({ where: { email } });

    if (isNotValid(user)) {
      return undefined;
    }

    const isValid = password === user.password;

    if (!isValid) {
      return undefined;
    }

    ctx.req.session.userId = user.id;

    return user;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      ctx.req.session.destroy((err) => {
        if (err) {
          logger.warn(err);
          return resolve(false);
        }

        deleteCache(CacheKey.LOGGED_USER);

        ctx.res.clearCookie("qid");
        return resolve(true);
      })
    );
  }

  @Mutation(() => Boolean)
  async resetPassword(@Arg("email") email: string): Promise<Boolean> {
    const user = await this.entityRepository.findOne({ where: { email } });

    if (isNotValid(user)) {
      return true;
    }

    const token = randomUUID();

    const oneDay = 60 * 60 * 24;

    setCache(this.changePasswordKey + token, user.id, oneDay);

    await this.notificationService.sendMail(
      email,
      HTMLTemplate.FORGOT_PASSWORD,
      {
        urlWithToken: `${FRONTEND_BASE_URL}/login?token=${token}`,
      }
    );

    return true;
  }

  @Mutation(() => Boolean, { nullable: true })
  async changePassword(
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string,
    @Ctx() ctx: MyContext
  ): Promise<boolean | undefined> {
    const userIdByContext = ctx.req.session.userId;

    let userId = userIdByContext;

    if (isNotValid(userId)) {
      userId = await getCache<string>(this.changePasswordKey + token);
    }

    if (isNotValid(userId)) {
      return undefined;
    }

    const user = await this.entityRepository.findOne(userId);

    if (isNotValid(user)) {
      return undefined;
    }

    if (isNotValid(userIdByContext)) {
      await deleteCache(this.changePasswordKey + token);
    }

    user.password = newPassword;

    await user.save();

    ctx.req.session.userId = user.id;

    await this.notificationService.sendMail(
      user.email,
      HTMLTemplate.PASSWORD_CHANGED,
      { urlLogin: `${FRONTEND_BASE_URL}/login` }
    );

    return true;
  }
}
