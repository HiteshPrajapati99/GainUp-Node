import { hendler } from "../helper/Handler.js";
import { uploadFile } from "../helper/uploadFile.js";
import { checkValueExist } from "../helper/CheckExistValue.js";
import Database from "../helper/Database.js";
import { db } from "../services/DB.js";
import { parseNestedJSON } from "../helper/JsonToObj.js";
import { sendWithOneSignal } from "../helper/sendNotification.js";

export const createPayment = hendler(async (req, res) => {
  const {
    user_name,
    amount,
    transaction_id,
    ph_number,
    plan_id,
    payment_type = 0,
  } = req.body;

  const user_id = req.user;

  const verify = checkValueExist(req, [
    "user_name",
    "amount",
    "transaction_id",
    "ph_number",
    "plan_id",
  ]);

  const screenShort = req.files?.screenShort || null;

  if (verify) return res.json({ s: 0, m: verify });

  if (!screenShort)
    return res.json({ s: 0, m: "Payment screen Short is required !" });

  const imagePath = await uploadFile(screenShort, "payment");

  const { data } = await Database.create({
    tableName: "transactions",
    values: {
      user_id,
      user_name,
      amount,
      transaction_id,
      ph_number,
      plan_id,
      screenShort: imagePath,
      payment_type,
    },
  });

  res.json({
    s: 1,
    m: "Congratulations ! Your transaction successfully added!",
    r: data,
  });
});

export const getPayment = hendler(async (req, res) => {
  const [data] = await db.query(
    "SELECT transactions.*, JSON_OBJECT('name' , plan.name, 'amount' ,plan.amount , 'duration', plan.duration , 'screenShort', plan.screenShort) AS plan_details FROM transactions LEFT JOIN plan ON transactions.plan_id = plan.id WHERE transactions.user_id = ?",
    [req.user]
  );

  if (data.length <= 0) return res.json({ s: 0, m: "No Data Found !" });

  const parsedArray = await parseNestedJSON(data);

  res.json({ s: 1, m: "Data Found !", r: parsedArray });
});

// export const getAll

export const getAllPayment = hendler(async (req, res) => {
  const [data] = await db.query(
    "SELECT transactions.*, JSON_OBJECT('name' , plan.name, 'amount' ,plan.amount , 'duration', plan.duration , 'screenShort', plan.screenShort) AS plan_details FROM transactions LEFT JOIN plan ON transactions.plan_id = plan.id"
  );

  const parseData = await parseNestedJSON(data);

  return res.json({ s: 1, m: "Data Found !", r: parseData });
});

export const updatePayment = hendler(async (req, res) => {
  const { id, isVerified } = req.body;

  const verify = checkValueExist(req, ["id", "isVerified"]);

  if (verify) return res.json({ s: 0, m: verify });

  const { data: checkIsOld } = await Database.findOne({
    tableName: "transactions",
    where: {
      id,
    },
  });

  if (checkIsOld.isVerified)
    return res.json({ s: 0, m: "This transaction is allredy verifiedy !" });

  const data = await Database.update({
    tableName: "transactions",
    updateFields: {
      isVerified,
    },
    where: {
      id,
    },
    returnUpdatedBy: { id },
  });

  if (!data) return res.json({ s: 0, m: "something went wrong !" });

  // if (isVerified == 0)
  //   return res.json({ s: 0, m: "Payment is successfully rejected!" });

  const { data: plan } = await Database.findOne({
    tableName: "plan",
    where: {
      id: data.plan_id,
    },
  });

  const add_time_month = plan.duration;

  const plan_duration_date = new Date(
    new Date(data.created_at).setMonth(
      new Date(data.created_at).getMonth() + add_time_month
    )
  );

  const user = await Database.update({
    tableName: "user_details",
    updateFields: {
      isPremium: 1,
      plan_id: data.plan_id,
      premiumExpiry: plan_duration_date,
    },
    where: {
      id: data.user_id,
    },
    returnUpdatedBy: {
      id: data.user_id,
    },
  });

  // send Notification

  await sendWithOneSignal({
    title: "Payment Verification Complete",
    body: `Hello ${
      user?.user_name ?? ""
    }, we're pleased to inform you that your payment has been successfully verified. Enjoy uninterrupted access to premium content. Thank you for your support!`,
    sendTo: [data.user_id],
  });

  res.json({
    s: 1,
    m: "Transaction is successfully verified !",
  });
});
