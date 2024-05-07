import { Router } from "express";
import { createPlan, getAllPlan, updatePlan } from "../controllers/plans.js";

const route = Router();

route.post("/create", createPlan);
route.get("/get-all", getAllPlan);
route.post("/update", updatePlan);

export default route;
