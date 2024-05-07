import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";
import { hendler } from "../helper/Handler.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import { fireBaseDB } from "../services/firebase.js";
import { db } from "../services/DB.js";
import { sendWithOneSignal } from "../helper/sendNotification.js";

// =================  MAIN TIP CONTROLS ================= //

// CREATE NEW TIP
export const createTip = hendler(async (req, res) => {
  const {
    action,
    amount,
    duration,
    isTradeClose = false,
    netGain,
    optionsType,
    title,
    trades,
    type,
    isPremium,
    status = 1,
    sub_title,
  } = req.body;

  const verify = checkValueExist(req, [
    "action",
    "amount",
    "duration",
    "optionsType",
    "title",
    "trades",
    "type",
    "isPremium",
  ]);

  if (verify) return res.json({ s: 0, m: verify });

  const { data } = await Database.create({
    tableName: "data",
    values: {
      action,
      amount,
      duration,
      isTradeClose,
      netGain,
      optionsType,
      title,
      trades,
      type,
      isPremium,
      status,
      sub_title,
    },
  });

  const { id, ...rest } = data;

  await addDoc(collection(fireBaseDB, "data"), {
    trad_id: id,
    ...rest,
    targets: [],
  });

  // Notification

  const users_id = [];

  if (parseInt(isPremium) === 1) {
    const [p] = await db.query(
      "select id from user_details where isPremium = 1 AND isNotification = 1"
    );
    p.forEach((d) => users_id.push(d.id));
  } else {
    const [n] = await db.query(
      "select id from user_details WHERE isNotification = 1"
    );

    n?.forEach((d) => users_id.push(d.id));
  }

  const notifyBody = `Buy ${
    String(title).split("-")[0] || ""
  }, Click here to know more details`;

  if (users_id.length) {
    const result = await sendWithOneSignal({
      title: "New trade is added 💸🤑",
      body: notifyBody,
      sendTo: users_id,
    });

    if (result.s) {
      await Database.create({
        tableName: "notifications",
        values: {
          title: "New trade is added 💸🤑",
          body: notifyBody,
          isRead: 1,
        },
      });
    }
  }

  res.json({ s: 1, m: "New Tip Created Success!", r: data });
});

// UPDATE TIP
export const updateTip = hendler(async (req, res) => {
  const {
    action,
    amount,
    duration,
    isTradeClose,
    netGain,
    optionsType,
    title,
    trades,
    type,
    trad_id,
    isPremium,
    status,
  } = req.body;

  const verify = checkValueExist(req, ["trad_id"]);

  if (verify) return res.json({ s: 0, m: verify });

  const data = await Database.update({
    tableName: "data",
    updateFields: {
      action,
      amount,
      duration,
      isTradeClose: status == 0 ? 0 : isTradeClose,
      netGain,
      optionsType,
      title,
      trades,
      type,
      isPremium,
      status,
    },
    where: {
      id: trad_id,
    },
    returnUpdatedBy: {
      id: trad_id,
    },
  });

  if (!data) return res.json({ s: 0, m: "At list one field is required!" });

  //   update in firebase

  const { id, ...rest } = data;

  const docRef = query(
    collection(fireBaseDB, "data"),
    where("trad_id", "==", Number(trad_id))
  );

  const docData = await getDocs(docRef);

  docData.forEach(async (d) => {
    const dd = doc(fireBaseDB, "data", d.id);
    await updateDoc(dd, rest);
  });

  res.json({ s: 1, m: "Data updated success !", r: data });
});

// =================   TIP ITEM CONTROLLERS ================= //

// CREATE NEW TIP
export const createItem = hendler(async (req, res) => {
  const { amount, hitType, name, type, trad_id } = req.body;

  const verify = checkValueExist(req, [
    "amount",
    "hitType",
    "name",
    "type",
    "trad_id",
  ]);

  if (verify) return res.json({ s: 0, m: verify });

  const { data: target } = await Database.create({
    tableName: "targets",
    values: {
      amount,
      hitType,
      name,
      type,
      trad_id,
    },
  });

  const [data] = await db.query(
    "select * from targets where trad_id = ? AND status = ?",
    [trad_id, 1]
  );

  const f_data = data.map(({ amount, hitType, name, type, id }) => ({
    amount,
    hitType,
    name,
    type,
    target_id: id,
  }));

  const docRef = query(
    collection(fireBaseDB, "data"),
    where("trad_id", "==", Number(trad_id))
  );

  const docData = await getDocs(docRef);

  docData.forEach(async (d) => {
    const dd = doc(fireBaseDB, "data", d.id);
    await updateDoc(dd, {
      targets: f_data,
    });
  });

  res.json({ s: 1, m: "New Item Created Success!", r: target });
});

// UPDATE TIP
export const updateItem = hendler(async (req, res) => {
  const { amount, hitType, name, type, target_id, status } = req.body;

  const verify = checkValueExist(req, ["target_id"]);

  if (verify) return res.json({ s: 0, m: verify });

  const target = await Database.update({
    tableName: "targets",
    updateFields: {
      amount,
      hitType,
      name,
      type,
      status,
    },
    where: {
      id: target_id,
    },
    returnUpdatedBy: {
      id: target_id,
    },
  });

  if (!target) return res.json({ s: 0, m: "At list one field is required!" });

  //   update in firebase

  const [data] = await db.query(
    "select * from targets where trad_id = ? AND status = ?",
    [target.trad_id, 1]
  );

  const f_data = data.map(({ amount, hitType, name, type, id }) => ({
    amount,
    hitType,
    name,
    type,
    target_id: id,
  }));

  const docRef = query(
    collection(fireBaseDB, "data"),
    where("trad_id", "==", Number(target.trad_id))
  );

  const docData = await getDocs(docRef);

  docData.forEach(async (d) => {
    const dd = doc(fireBaseDB, "data", d.id);
    await updateDoc(dd, {
      targets: f_data,
    });
  });

  res.json({ s: 1, m: "Data updated success !", r: target });
});
