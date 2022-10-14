import { Service } from "typedi";
import { MiddlewareInterface, NextFn, ResolverData } from "type-graphql";

import logger from "logger";

@Service()
export class ErrorLoggerMiddleware implements MiddlewareInterface {
  async use(data: ResolverData, next: NextFn) {
    try {
      return await next();
    } catch (err) {
      logger.error(err);

      throw err;
    }
  }
}
