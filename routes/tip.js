import { Router } from "express";
import {
  createTip,
  createItem,
  updateTip,
  updateItem,
} from "../controllers/tip.js";

const tipRouter = Router();

// MAIN TIP ROUTES

tipRouter.post("/main/create", createTip);
tipRouter.post("/main/update", updateTip);

// TIP ITEM ROUTES

tipRouter.post("/item/create", createItem);
tipRouter.post("/item/update", updateItem);

// sub category Type

export default tipRouter;
