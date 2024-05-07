import handler from "express-async-handler";
import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";
import { db } from "../services/DB.js";

export const addPrivacyTerm = handler(async (req, res) => {
  try {
    const check = checkValueExist(req, ["text", "type"]);
    if (check) return res.json({ s: 0, m: check });

    const { text, type } = req.body;
    const { data } = await Database.create({
      tableName: "privacy_policy",
      values: {
        text,
        type,
      },
    });

    if (data) {
      res.json({
        s: 1,
        m: `${
          type == 1 ? "Privecy Policy" : "Term And Condition"
        } Added Successfully.`,
        r: data,
      });
    } else {
      res.json({ s: 0, m: "Server ERROR" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const getPrivacyTerm = handler(async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) return res.json({ s: 0, m: "Type is required !" });

    const [data] = await db.query(
      "SELECT * FROM privacy_policy WHERE type = ?",
      [type]
    );

    if (data.length !== 0) {
      res.json({
        s: 1,
        m: `${type == 1 ? "Privecy Policy" : "Term And Condition"} Data Found.`,
        r: data[0],
      });
    } else {
      res.json({ s: 0, m: "No Data Found !" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const updatePrivacyTerm = handler(async (req, res) => {
  try {
    const { text, id } = req.body;

    const check = checkValueExist(req, ["id", "text"]);
    if (check) return res.json({ s: 0, m: check });

    const data = await Database.update({
      tableName: "privacy_policy",
      updateFields: { text },
      where: {
        id,
      },
      returnUpdatedBy: {
        id,
      },
    });

    if (!data) return res.json({ s: 0, m: "At list one field is required!" });

    res.json({ s: 1, m: "Data Updated Successfully !", r: data });
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});
