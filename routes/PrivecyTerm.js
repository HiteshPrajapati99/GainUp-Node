import { Router } from "express";
import {
  addPrivacyTerm,
  getPrivacyTerm,
  updatePrivacyTerm,
} from "../controllers/privacy_policy.js";

const route = Router();

route.post("/create", addPrivacyTerm);
route.post("/update", updatePrivacyTerm);
route.get("/get-all", getPrivacyTerm);

export default route;
