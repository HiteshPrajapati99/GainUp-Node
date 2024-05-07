import { Router } from "express";
import { add, getAll, update } from "../controllers/subCategory.js";

const router = Router();

router.post("/add", add);
router.post("/update", update);
router.get("/get-all", getAll);

export default router;
