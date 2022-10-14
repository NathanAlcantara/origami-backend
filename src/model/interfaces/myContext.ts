import { Request, Response } from "express";

declare module "express-session" {
  export interface SessionData {
    userId: string;
  }
}

export interface MyContext {
  req: Request;
  res: Response;
}