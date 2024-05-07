import { config } from "../config/index.js";
import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";
import { hendler } from "../helper/Handler.js";
import { sendWithOneSignal } from "../helper/sendNotification.js";
import { uploadFile } from "../helper/uploadFile.js";
import { db } from "../services/DB.js";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  where,
  getDocs,
  query,
} from "firebase/firestore";
import { fireBaseDB } from "../services/firebase.js";

export const SENDNOTIFICATIONTOALL = hendler(async (req, res) => {
  const { title, body, type } = req.body;
  // type 0 all user type 1 premium

  // if (reminder_id) {
  //   const { data } = await Database.findOne({
  //     tableName: "notifications",
  //     where: {
  //       id: reminder_id,
  //     },
  //   });

  //   const result = await sendWithOneSignal({
  //     title: data.title,
  //     body: data.body,
  //     sendTo: users_id,
  //   });
  // }

  //  need notification history
  const verify = checkValueExist(req, ["title", "body", "type"]);

  if (verify) return res.json({ s: 0, m: verify });

  let imagePath = null;

  if (req.files?.image) {
    imagePath =
      config.live_base_url +
      (await uploadFile(req.files?.image, "notification"));
  }

  const users_id = [];

  if (type == 1) {
    const [data] = await db.query(
      "select id from user_details where isPremium = 1 AND isNotification = 1"
    );
    data.forEach((d) => users_id.push(d.id));
  } else {
    const [data] = await db.query(
      "select id from user_details WHERE isNotification = 1"
    );

    data.forEach((d) => users_id.push(d.id));
  }

  if (!users_id.length)
    return res.json({
      s: 0,
      m: "No Users Found !",
    });

  const result = await sendWithOneSignal({
    ...(imagePath && { image: imagePath }),
    title: title,
    body: body,
    sendTo: users_id,
  });

  if (result.s) {
    await Database.create({
      tableName: "notifications",
      values: { title, body, image: imagePath, isRead: 1 },
    });
  }

  res.json({
    s: result.s,
    m: result.m,
  });
});

export const getAll = hendler(async (req, res) => {
  const data = await Database.find({
    tableName: "notifications",
  });

  if (data.length) {
    res.json({ s: 1, m: "Data Found !", r: data });
  } else {
    res.json({ s: 0, m: "No Data Found !" });
  }
});

export const updateNotification = hendler(async (req, res) => {
  const { isRead, id } = req.body;

  const verify = checkValueExist(req, ["isRead", "id"]);

  if (verify) return res.json({ s: 0, m: verify });

  const data = await Database.update({
    tableName: "notifications",
    updateFields: {
      isRead,
    },
    where: {
      id,
    },
    returnUpdatedBy: {
      id,
    },
  });

  res.json({ s: 1, m: "Data updated Success !", r: data });
});
