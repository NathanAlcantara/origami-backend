import { User } from "@entities/user";
import { MyContext } from "@interfaces/myContext";
import { EIGHT_HOURS_IN_MS } from "envs";
import { CacheKey, setCache } from "redisUtils";
import { AuthChecker } from "type-graphql";
import { getRepository } from "typeorm";
import { isNotValid, isValid } from "utils";

const authChecker: AuthChecker<MyContext> = async (
  { context: { req } },
  roles
) => {
  const userId = req.session.userId;

  if (isNotValid(userId)) {
    return false;
  }

  const loggedUser = await getRepository(User).findOneOrFail(userId, {
    cache: EIGHT_HOURS_IN_MS,
    relations: ["person"],
  });

  if (isNotValid(loggedUser)) {
    return false;
  }

  setCache(CacheKey.LOGGED_USER, loggedUser);

  const hasPermission = isValid(roles)
    ? roles.some((role) => role === loggedUser.role)
    : true;

  return hasPermission;
};

export default authChecker;
