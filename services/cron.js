import schedule from "node-schedule";
import { db } from "./DB.js";

const updatePremiumUser = async () => {
  await db.query(
    `UPDATE user_details SET isPremium = 0 , plan_id = null WHERE isPremium = 1 AND premiumExpiry <= CURDATE()`
  );
};

export const nodeSchedule = () => {
  const job = schedule.scheduleJob("0 0 * * *", function (date) {
    // console.log("run end of every day" + date);

    updatePremiumUser();
  });
};
