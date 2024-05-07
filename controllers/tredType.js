import handler from "express-async-handler";
import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { fireBaseDB } from "../services/firebase.js";
import { uploadFile } from "../helper/uploadFile.js";
import fs from "fs";

export const add = handler(async (req, res) => {
  try {
    const { name, type, status = 1 } = req.body;

    const check = checkValueExist(req, ["name", "type"]);
    if (check) return res.json({ s: 0, m: check });

    if (!req.files?.image) return res.json({ s: 0, m: "Image is required !" });

    const imagePath = await uploadFile(req.files.image, "trade");

    const { data } = await Database.create({
      tableName: "trade_type",
      values: {
        image: imagePath,
        name,
        type,
        status,
      },
    });

    // add firebase
    const { id, ...rest } = data;
    await addDoc(collection(fireBaseDB, "trade_type"), {
      trade_id: id,
      ...rest,
    });

    if (data) {
      res.json({ s: 1, m: "New Data Added Successfully.", r: data });
    } else {
      res.json({ s: 0, m: "Server ERROR" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const getAll = handler(async (req, res) => {
  try {
    const data = await Database.find({
      tableName: "trade_type",
      where: { status: 1 },
    });
    if (data.length !== 0) {
      res.json({ s: 1, m: "Data Successfully.", r: data });
    } else {
      res.json({ s: 0, m: "No Data Found !" });
    }
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});

export const update = handler(async (req, res) => {
  try {
    const { name, type, status, trade_id } = req.body;
    if (!trade_id) return res.json({ s: 0, m: "Required : trade_id" });

    let imagePath = null;

    const { data: oldData } = await Database.findOne({
      tableName: "trade_type",
      where: {
        id: trade_id,
      },
    });

    if (!oldData) return res.json({ s: 0, m: "No Data Found !" });

    if (req.files?.image) {
      if (fs.existsSync("." + oldData.image)) {
        fs.unlinkSync("." + oldData.image);
      }

      imagePath = await uploadFile(req.files?.image, "trade");
    }

    const data = await Database.update({
      tableName: "trade_type",
      updateFields: { name, type, status, image: imagePath ?? oldData.image },
      where: {
        id: trade_id,
      },
      returnUpdatedBy: {
        id: trade_id,
      },
    });

    if (!data) return res.json({ s: 0, m: "At list one field is required!" });

    //   update in firebase

    const { id, ...rest } = data;

    const docRef = query(
      collection(fireBaseDB, "trade_type"),
      where("trade_id", "==", Number(trade_id))
    );

    const docData = await getDocs(docRef);

    docData.forEach(async (d) => {
      const dd = doc(fireBaseDB, "trade_type", d.id);
      await updateDoc(dd, rest);
    });

    res.json({ s: 1, m: "Data Updated Successfully !", r: data });
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});
