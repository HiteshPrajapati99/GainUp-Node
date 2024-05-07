import { Router } from "express";
import { addFaq, getFaq, updateFaq } from "../controllers/faq.js";

const route = Router();

route.post("/create", addFaq);
route.post("/update", updateFaq);
route.get("/get-all", getFaq);

export default route;
