import handler from "express-async-handler";
import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";
import { uploadFile } from "../helper/uploadFile.js";
import { db } from "../services/DB.js";
import fs from "fs";

export const addBanner = handler(async (req, res) => {
  try {
    const check = checkValueExist(req, ["type"]);
    // status
    if (check) return res.json({ s: 0, m: check });

    if (!req.files?.image) {
      return res.json({ s: 0, m: "Image File is required !" });
    }
    const path = await uploadFile(req.files.image, "banners");
    const { data } = await Database.create({
      tableName: "banners",
      values: {
        image: path,
        type: req.body.type,
        isFav: req.body.isFav || 0,
        link: req.body.link || null,
      },
    });

    if (data) {
      res.json({ s: 1, m: "Data Added Successfully.", r: data });
    } else {
      res.json({ s: 0, m: "Server Error" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const getBanner = handler(async (req, res) => {
  try {
    if (!req.query.type) return res.json({ s: 0, m: "type is required!" });

    const [data] = await db.query(
      "SELECT * FROM banners WHERE type = ? AND status = ?",
      [req.query.type, 1]
    );

    if (data.length !== 0) {
      res.json({ s: 1, m: "Data Found.", r: data });
    } else {
      res.json({ s: 0, m: "No Faq Data Found !" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const updateBanner = handler(async (req, res) => {
  try {
    const { id, status, isFav, link } = req.body;

    if (!id) return res.json({ s: 0, m: "Required : id" });

    let path = null;

    if (req.files?.image) {
      const { data: oldData } = await Database.findOne({
        tableName: "banners",
        where: {
          id,
        },
      });

      if (fs.existsSync("." + oldData.image)) {
        fs.unlinkSync("." + oldData.image);
      }

      path = await uploadFile(req.files.image, "banners");
    }

    const data = await Database.update({
      tableName: "banners",
      updateFields: {
        ...(path && { image: path }),
        status: status || 1,
        isFav: isFav || 0,
        link,
      },
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
