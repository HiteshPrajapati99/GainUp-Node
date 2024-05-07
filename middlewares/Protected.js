import handler from "express-async-handler";
import { db } from "../services/DB.js";

export const authMiddleware = handler(async (req, res, next) => {
  try {
    const token = req.body.token || req.headers["token"] || req.query.token;

    if (!token) return res.json({ s: 0, m: "Token is required!" });

    const [userData] = await db.query(
      "SELECT * FROM user_details WHERE token = ?",
      [token]
    );

    if (userData.length !== 0) {
      req.user = userData[0].id;

      next();
    } else {
      res.json({ s: 0, m: "Invalid Token..." });
    }
  } catch (error) {
    res.json({ s: 0, m: error });
  }
});
