import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { ErrorLoggerMiddleware } from "./errorLogger";

import { LogAccessMiddleware } from "./logAccess";

export const middlewares: Array<Middleware<any>> = [
  LogAccessMiddleware,
  ErrorLoggerMiddleware,
];

export default middlewares;
