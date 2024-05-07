import handler from "express-async-handler";
import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";

export const addAbout = handler(async (req, res) => {
  try {
    const check = checkValueExist(req, ["text"]);
    if (check) return res.json({ s: 0, m: check });

    const { text } = req.body;
    const { data } = await Database.create({
      tableName: "about",
      values: {
        text,
      },
    });

    if (data) {
      res.json({ s: 1, m: "About Added Successfully.", r: data });
    } else {
      res.json({ s: 0, m: "Server ERROR" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const getAbout = handler(async (req, res) => {
  try {
    const data = await Database.find({
      tableName: "about",
    });
    if (data.length !== 0) {
      res.json({ s: 1, m: "About Data Found.", r: data[0] });
    } else {
      res.json({ s: 0, m: "No Faq Data Found !" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const updateAbout = handler(async (req, res) => {
  try {
    const { text, id } = req.body;
    if (!id) return res.json({ s: 0, m: "Required : id" });

    const data = await Database.update({
      tableName: "about",
      updateFields: { text },
      where: {
        id,
      },
      returnUpdatedBy: {
        id,
      },
    });

    if (!data) return res.json({ s: 0, m: "At list one field is required!" });

    res.json({ s: 1, m: "About Updated Successfully !", r: data });
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});
