import { Router } from "express";
import { addAbout, getAbout, updateAbout } from "../controllers/about.js";

const route = Router();

route.post("/create", addAbout);
route.post("/update", updateAbout);
route.get("/get-all", getAbout);

export default route;
