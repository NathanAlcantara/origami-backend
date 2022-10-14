import { ConnectionOptions } from "typeorm";

const { DATABASE_URL, NODE_ENV } = process.env;

const isProduction = NODE_ENV === "production";

const dir = isProduction ? "build" : "src";

let config: ConnectionOptions = {
  type: "postgres",
  url: DATABASE_URL,
  port: 5432,
  synchronize: false,
  logging: false,
  migrationsRun: true,
  entities: [`${dir}/model/entity/**/*.{ts,js}`],
  migrations: [`${dir}/model/migration/**/*.{ts,js}`],
  subscribers: [`${dir}/model/subscriber/**/*.{ts,js}`],
  cli: {
    migrationsDir: `${dir}/model/migration`,
    entitiesDir: `${dir}/model/entity`,
    subscribersDir: `${dir}/model/subscriber`,
  },
};

if (isProduction || !DATABASE_URL.includes("localhost")) {
  config = {
    ...config,
    ...{
      ssl: {
        rejectUnauthorized: false,
      },
    },
  };
}

export = config;
