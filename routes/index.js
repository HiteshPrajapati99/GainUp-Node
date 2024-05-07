import { Router } from "express";
import authRouter from "./auth.js";
import {
  SENDNOTIFICATIONTOALL,
  getAll,
  updateNotification,
} from "../controllers/sendNotification.js";
import { authMiddleware } from "../middlewares/Protected.js";
import faqRouter from "./faq.js";
import aboutRouter from "./about.js";
import PrivecyRouter from "./PrivecyTerm.js";
import bannerRouter from "./banner.js";
import { ONE_ID_ADD_UPDATE } from "../controllers/oneId.js";
import tipRouter from "./tip.js";
import subCateRouter from "./SubCate.js";
import tradeRouter from "./tredType.js";
import planRouter from "./plan.js";
import paymentRouter from "./payment.js";

const allRoutes = Router();

allRoutes.use("/auth", authRouter);
allRoutes.use("/tip", tipRouter);
allRoutes.use("/faq", faqRouter);
allRoutes.use("/about", aboutRouter);
allRoutes.use("/privacy-term", PrivecyRouter);
allRoutes.use("/banner", bannerRouter);
allRoutes.use("/trade-type", tradeRouter);
allRoutes.use("/sub-category", subCateRouter);
allRoutes.use("/plan", planRouter);
allRoutes.use("/payment", authMiddleware, paymentRouter);

// Other's

allRoutes.post("/add_update_oneId", authMiddleware, ONE_ID_ADD_UPDATE);

allRoutes.post("/send_notification", SENDNOTIFICATIONTOALL);
allRoutes.get("/get_notification", getAll);
allRoutes.post("/update_notification", updateNotification);

export default allRoutes;
