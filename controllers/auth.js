import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";
import { hendler } from "../helper/Handler.js";
import bcrypt from "bcrypt";
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
import fs from "fs";

//  LOGIN USER
export const login = hendler(async (req, res) => {
  const { f_id } = req.body;

  const verify = checkValueExist(req, ["f_id"]);

  if (verify) return res.json({ s: 0, m: verify });

  const { data: user } = await Database.findOne({
    tableName: "user_details",
    where: {
      f_id,
    },
  });

  if (!user) {
    return res.json({ s: 0, m: "Invalid Credantial !" });
  }

  // const isPassword = bcrypt.compareSync(password, user.password);

  // if (!isPassword) {
  //   return res.json({ s: 0, m: "Invalid Credantial !" });
  // }

  return res.json({
    s: 1,
    m: "Login success !",
    r: user,
  });
});

//  REGISTER USER

export const register = hendler(async (req, res) => {
  const { email, password, ph_no, f_id, user_name } = req.body;
  const verify = checkValueExist(req, ["email", "f_id"]);

  if (verify) return res.json({ s: 0, m: verify });

  const { data } = await Database.findOne({
    tableName: "user_details",
    where: {
      email,
    },
  });

  if (data) {
    return res.json({ s: 0, m: "Account allredy exist!" });
  }

  let imageurl;

  if (req.files && req.files.profile_img) {
    imageurl = await uploadFile(req.files.profile_img, "user");
  }

  const hashPassword = password
    ? bcrypt.hashSync(password, 10, function (err, hash) {
        return hash;
      })
    : null;

  const token = bcrypt.hashSync(email, 10, function (err, hash) {
    return hash;
  });

  // my sql
  const { data: newUser } = await Database.create({
    tableName: "user_details",
    values: {
      email,
      password: hashPassword,
      ph_no,
      profile_img: imageurl,
      token,
      f_id,
      user_name,
    },
  });

  //  firebase

  // const colleton = collection(fireBaseDB, "user");

  const { id, ...rest } = newUser;

  await addDoc(collection(fireBaseDB, "user"), {
    user_id: newUser.id,
    ...rest,
  });

  return res.json({
    s: 1,
    m: "Registration success !",
    r: newUser,
  });
});

// UPDATE USER

export const updateUser = hendler(async (req, res) => {
  const { ph_no, isPremium, isNotification, user_name, f_id, is_accept_term } =
    req.body;

  const check = checkValueExist(req, ["f_id"]);
  if (check) return res.json({ s: 0, m: check });

  const { data: user } = await Database.findOne({
    tableName: "user_details",
    where: { f_id },
  });

  if (!user) return res.json({ s: 0, m: "No user found !" });

  let profile_url = null;

  if (req.files?.profile_img) {
    if (fs.existsSync("." + user.profile_img || "")) {
      fs.unlinkSync("." + user.profile_img);
    }

    profile_url = await uploadFile(req.files?.profile_img, "user");
  }

  const data = await Database.update({
    tableName: "user_details",
    updateFields: {
      is_accept_term: is_accept_term || user.is_accept_term,
      ph_no,
      isPremium,
      isNotification,
      user_name,
      ...(profile_url && { profile_img: profile_url }),
    },
    where: {
      f_id,
    },
    returnUpdatedBy: {
      f_id,
    },
  });

  const { id, ...rest } = data;

  if (!data)
    return res.json({ s: 0, m: "At list one field is required to update!" });

  const querySnapshot = await getDocs(
    query(collection(fireBaseDB, "user"), where("user_id", "==", data.id))
  );

  querySnapshot.forEach(async (d) => {
    const docRef = doc(fireBaseDB, "user", d.id);

    await updateDoc(docRef, rest);
  });

  res.json({ s: 1, m: "User Updated Success !", r: data });
});

// GET ALL USERS

export const getAllUser = hendler(async (req, res) => {
  const type = req.query?.type; // !  1 is_Premium 0 ALl users And 2 non Premium

  if (!["0", "1", "2"].includes(type)) {
    return res.json({
      s: 0,
      m: "Type is required :-",
      desc: " Type 1 => Premium User  /n/ ,  Type 2 => NoN Premium User ,/n/  0 =>  All User",
    });
  }

  let q = "SELECT * FROM user_details";

  if (type == 1) {
    q += " WHERE isPremium = 1";
  }

  if (type == 2) {
    q += " WHERE isPremium = 0";
  }

  const [data] = await db.query(q);

  res.json({
    s: 1,
    m: "Data Found !",
    r: data,
  });
});
