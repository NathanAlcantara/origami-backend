import dotenv from "dotenv";

const result = dotenv.config();

const processEnv = process.env;

if (!processEnv.NODE_ENV && result.error) {
  throw new Error(".env not defined");
}

let { parsed } = result;

if (!parsed) {
  parsed = processEnv;
}

const envs = {
  FRONTEND_BASE_URL: parsed.FRONTEND_BASE_URL,
  DATABASE_URL: parsed.DATABASE_URL,
  REDIS_URL: parsed.REDIS_URL,
  NODE_ENV: parsed.NODE_ENV,
  SESSION_SECRET: parsed.SESSION_SECRET,
  SMTP_HOST: parsed.SMTP_HOST,
  SMTP_USER: parsed.SMTP_USER,
  SMTP_PASS: parsed.SMTP_PASS,
};

export const {
  FRONTEND_BASE_URL,
  DATABASE_URL,
  REDIS_URL,
  NODE_ENV,
  SESSION_SECRET,
  SMTP_HOST,
  SMTP_USER,
  SMTP_PASS,
} = envs;

export const isProduction = NODE_ENV === "production";

export const EIGHT_HOURS_IN_MS = 1000 * 60 * 60 * 8;

export default envs;