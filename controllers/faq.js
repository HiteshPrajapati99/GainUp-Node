import handler from "express-async-handler";
import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";

export const addFaq = handler(async (req, res) => {
  try {
    const check = checkValueExist(req, ["question", "answer"]);
    if (check) return res.json({ s: 0, m: check });

    const { answer, question } = req.body;
    const { data } = await Database.create({
      tableName: "faq",
      values: {
        answer,
        question,
      },
    });

    if (data) {
      res.json({ s: 1, m: "New FAQ Added Successfully.", r: data });
    } else {
      res.json({ s: 0, m: "Server ERROR" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const getFaq = handler(async (req, res) => {
  try {
    const data = await Database.find({
      tableName: "faq",
      where: { status: 1 },
    });
    if (data.length !== 0) {
      res.json({ s: 1, m: "FAQ Data Successfully.", r: data });
    } else {
      res.json({ s: 0, m: "No Faq Data Found !" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const updateFaq = handler(async (req, res) => {
  try {
    const { answer, question, status, id } = req.body;
    if (!id) return res.json({ s: 0, m: "Required : id" });

    const data = await Database.update({
      tableName: "faq",
      updateFields: { answer, question, status },
      where: {
        id,
      },
      returnUpdatedBy: {
        id,
      },
    });

    if (!data) return res.json({ s: 0, m: "At list one field is required!" });

    res.json({ s: 1, m: "Faq Updated Successfully !", r: data });
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});
