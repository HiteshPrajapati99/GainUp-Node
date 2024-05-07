import Database from "../helper/Database.js";
import { checkValueExist } from "../helper/CheckExistValue.js";
import { hendler } from "../helper/Handler.js";

export const ONE_ID_ADD_UPDATE = hendler(async (req, res) => {
  const { one_id, device_id } = req.body;
  const user_id = req.user;

  const verify = checkValueExist(req, ["one_id", "device_id"]);

  if (verify) return res.json({ s: 0, m: verify });

  const { data: check } = await Database.findOne({
    tableName: "one_token",
    where: {
      user_id,
      device_id,
    },
  });

  if (check) {
    await Database.update({
      tableName: "one_token",
      where: {
        id: check.id,
      },
      updateFields: {
        one_id,
      },
    });
  } else {
    await Database.create({
      tableName: "one_token",
      values: {
        user_id,
        one_id,
        device_id,
      },
    });
  }

  return res.json({ s: 1, m: "Success !" });
});
