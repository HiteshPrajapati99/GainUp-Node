import { hendler } from "../helper/Handler.js";
import { uploadFile } from "../helper/uploadFile.js";
import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";
import fs from "fs";

export const createPlan = hendler(async (req, res) => {
  const { name, amount, duration } = req.body;

  const verify = checkValueExist(req, ["name", "amount", "duration"]);

  const screenShort = req.files?.screenShort || null;

  if (verify) return res.json({ s: 0, m: verify });

  if (!screenShort) return res.json({ s: 0, m: "QR is required !" });

  const imagePath = await uploadFile(screenShort, "payment");

  const { data } = await Database.create({
    tableName: "plan",
    values: {
      name,
      amount,
      duration,
      screenShort: imagePath,
    },
  });

  res.json({
    s: 1,
    m: "Congratulations ! Your transaction successfully added!",
    r: data,
  });
});

export const getAllPlan = hendler(async (req, res) => {
  const data = await Database.find({
    tableName: "plan",
    where: {
      status: 1,
    },
  });

  if (data.length <= 0) return res.json({ s: 0, m: "No Data Found !" });

  res.json({ s: 1, m: "Data Found !", r: data });
});

export const updatePlan = hendler(async (req, res) => {
  const { name, amount, duration, id, status } = req.body;

  const check = checkValueExist(req, ["id"]);
  if (check) return res.json({ s: 0, m: check });

  const { data: plan } = await Database.findOne({
    tableName: "plan",
    where: { id },
  });

  if (!plan) return res.json({ s: 0, m: "No plan found !" });

  let imageUrl = null;

  if (req.files?.screenShort) {
    if (fs.existsSync("." + plan.screenShort || "")) {
      fs.unlinkSync("." + plan.screenShort);
    }

    imageUrl = await uploadFile(req.files?.screenShort, "payment");
  }

  const data = await Database.update({
    tableName: "plan",
    updateFields: {
      name,
      amount,
      duration,
      status,
      ...(imageUrl && { screenShort: imageUrl }),
    },
    where: {
      id,
    },
    returnUpdatedBy: {
      id,
    },
  });

  if (!data) return res.json({ s: 0, m: "At list one field is required!" });

  res.json({ s: 1, m: "Plan Updated successfully !", r: data });
});
