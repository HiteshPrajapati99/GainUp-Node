// express async and tryCatch handler use
import asynchandler from "express-async-handler";

// import asynchandler from "express-async-handler";
// import { Request, Response } from "express";

// type funcType (req: Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>): void

export const hendler = (func) => {
  return asynchandler((req, res) => {
    try {
      return func(req, res);
    } catch (error) {
      return res.json({ s: 0, m: error.message });
    }
  });
};
