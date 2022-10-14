import { Service } from "typedi";
import { MiddlewareInterface, NextFn, ResolverData } from "type-graphql";

import logger from "logger";
import { getLoggedUser } from "utils";

@Service()
export class LogAccessMiddleware implements MiddlewareInterface<any> {
  async use({ info, args }: ResolverData<any>, next: NextFn) {
    if (["Query", "Mutation"].includes(info.parentType.name)) {
      const loggedUser = await getLoggedUser();

      logger.info(
        `User ${loggedUser?.name} request a ${
          info.parentType.name
        } -> ${info.fieldName}: ${JSON.stringify(args)}`
      );
    }

    return next();
  }
}
