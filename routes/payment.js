import { Router } from "express";
import {
  createPayment,
  getAllPayment,
  getPayment,
  updatePayment,
} from "../controllers/payment.js";

const route = Router();

route.post("/create", createPayment);
route.get("/get-payment", getPayment);
route.post("/update", updatePayment);
route.get("/get-all", getAllPayment);

export default route;
