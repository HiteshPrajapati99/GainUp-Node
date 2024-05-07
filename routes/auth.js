import { Router } from "express";
import {
  getAllUser,
  login,
  register,
  updateUser,
} from "../controllers/auth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/get-user-email", login);
authRouter.post("/user/update", updateUser);
authRouter.get("/get-all", getAllUser);

export default authRouter;
