import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import { execute, GraphQLSchema, subscribe } from "graphql";
import { RedisPubSub } from "graphql-redis-subscriptions";
import http from "http";
import "reflect-metadata";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { buildSchema } from "type-graphql";
import Container from "typedi";

import { EIGHT_HOURS_IN_MS, isProduction, SESSION_SECRET } from "envs";
import logger from "logger";
import { createRedis, redis } from "redisUtils";

import { MyContext } from "src/model/interfaces/myContext";

import { createConnection } from "typeorm";
import authChecker from "./core/auth";
import { initializeEnvs } from "./core/config";
import middlewares from "./schema/middlewares";
import resolvers from "./schema/resolvers";

const corsOptions = {
  credentials: true,
  origin: "http://localhost:4200",
};

const initializeDB = async (): Promise<void> => {
  try {
    const connection = await createConnection();

    connection.runMigrations();

    logger.info("Database successfully initialized");
  } catch (error) {
    logger.error(`Database failed to connect ${error.message}`);
  }
};

export const createSchema = async (): Promise<GraphQLSchema> => {
  const pubSub = new RedisPubSub({
    publisher: createRedis() as any,
    subscriber: createRedis() as any,
  });

  return await buildSchema({
    resolvers,
    globalMiddlewares: middlewares,
    container: Container,
    emitSchemaFile: true,
    authChecker,
    pubSub,
  });
};

const configureApp = () => {
  const app = express();

  const RedisStore = connectRedis(session);

  app.use(cors(corsOptions));

  app.use(
    session({
      store: new RedisStore({
        client: redis,
      }),
      name: "qid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        maxAge: EIGHT_HOURS_IN_MS,
      },
    })
  );

  return app;
};

async function runServer() {
  initializeEnvs();

  await initializeDB();

  const schema = await createSchema();

  const app = configureApp();

  const httpServer = http.createServer(app);

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: "/graphql",
    }
  );

  const server = new ApolloServer({
    schema,
    context: ({ req, res }: MyContext) => ({
      req,
      res,
    }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      isProduction
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground({
            settings: {
              "request.credentials": "include",
            },
          }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();

  server.applyMiddleware({ app, cors: corsOptions });

  const port = process.env.PORT || 5000;

  httpServer.listen(port, () =>
    logger.info(
      `Server is running on http://localhost:${port}${server.graphqlPath}`
    )
  );
}

runServer().catch((err) => console.error(err));
