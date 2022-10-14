import { transports, createLogger, format } from "winston";

const consoleFormat = format.printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} - [${level}]: ${stack || message}`;
});

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: "logs/combined.log",
      handleExceptions: true,
    }),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new transports.Console({
      format: format.combine(format.colorize(), consoleFormat),
      handleExceptions: true,
    }),
  ],
});

export default logger;
