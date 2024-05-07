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

export const add = handler(async (req, res) => {
  try {
    const {
      duration,
      mainType,
      name,
      per,
      subTitle,
      type,
      status = 1,
    } = req.body;

    const check = checkValueExist(req, [
      "duration",
      "mainType",
      "name",
      "type",
    ]);
    if (check) return res.json({ s: 0, m: check });

    const imageFile = req.files?.image;

    if (!imageFile) {
      return res.json({ s: 0, m: "Please add image..." });
    }

    const imageURL = await uploadFile(imageFile, "trade");

    const { data } = await Database.create({
      tableName: "sub_category",
      values: {
        duration,
        mainType,
        name,
        per,
        subTitle,
        type,
        status,
        image: imageURL,
      },
    });

    // add firebase
    const { id, status: s, ...rest } = data;

    await addDoc(collection(fireBaseDB, "sub_catagory"), {
      sub_id: id,
      status: s,
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
      tableName: "sub_category",
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
    const { duration, mainType, name, per, subTitle, type, sub_id, status } =
      req.body;

    if (!sub_id) return res.json({ s: 0, m: "Required : sub_id" });

    let imageURL = null;

    if (req.files?.image) {
      imageURL = await uploadFile(req.files?.image, "trade");
    }

    const data = await Database.update({
      tableName: "sub_category",
      updateFields: {
        duration,
        mainType,
        name,
        per,
        subTitle,
        type,
        status,
        ...(imageURL && { image: imageURL }),
      },
      where: {
        id: sub_id,
      },
      returnUpdatedBy: {
        id: sub_id,
      },
    });

    if (!data) return res.json({ s: 0, m: "At list one field is required!" });

    //   update in firebase

    const { id, ...rest } = data;

    const docRef = query(
      collection(fireBaseDB, "sub_catagory"),
      where("sub_id", "==", Number(id))
    );

    const docData = await getDocs(docRef);

    docData.forEach(async (d) => {
      const dd = doc(fireBaseDB, "sub_catagory", d.id);
      await updateDoc(dd, rest);
    });

    res.json({ s: 1, m: "Data Updated Successfully !", r: data });
  } catch (error) {
    res.json({ s: 0, m: error.message });
  }
});
