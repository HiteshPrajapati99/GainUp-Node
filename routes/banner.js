import { Router } from "express";
import { addBanner, getBanner, updateBanner } from "../controllers/banner.js";

const route = Router();

route.post("/create", addBanner);
route.post("/update", updateBanner);
route.get("/get-all", getBanner);

export default route;
