import { config } from "../config/index.js";
import FCM from "fcm-node";
import { db } from "../services/DB.js";
import oneSignal from "@onesignal/node-onesignal";

// import Database from "./Database.js";

// onesignal

const app_key_provider = {
  getToken() {
    return config.ONESIGNAL_API_KEY;
  },
};

const configuration = oneSignal.createConfiguration({
  authMethods: {
    app_key: {
      tokenProvider: app_key_provider,
    },
  },
});

const client = new oneSignal.DefaultApi(configuration);

const fcm = new FCM(config.FCM_TOKEN_KEY);

export const sendNotification = async (notificationToSend, payload) => {
  try {
    const regTokens = [];

    const [fcmToken] = await db.query(
      "SELECT fcm_token FROM fcm_token WHERE user_id IN (?)",
      [payload.user_id]
    );
    if (fcmToken.length === 0) return "";

    fcmToken.forEach((t) => regTokens.push(t.fcm_token));

    const message = {
      registration_ids: regTokens,
      collapse_key: "FLUTTER_NOTIFICATION_CLICK",
      android_channel_id: "high_importance_channel",
      notification: notificationToSend,
      data: payload,
    };

    fcm.send(message, async (err, res) => {
      if (err) {
        console.log("Something has gone wrong!", err);
        return;
      } else {
        console.log("done");
        // await Database.create({
        //   tableName: "notification",
        //   values: {
        //     user_id: payload.user_id,
        //     title: notificationToSend.title,
        //     body: notificationToSend.body.slice(0, 230),
        //     image: notificationToSend?.image && notificationToSend?.image,
        //   },
        // });

        return;
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendWithOneSignal = async ({
  title = "",
  body = "",
  image = "",
  sendTo = [],
}) => {
  const segments = [];

  const [oneIdList] = await db.query(
    "SELECT one_id FROM one_token WHERE user_id IN(?)",
    [sendTo]
  );

  oneIdList?.length && oneIdList.forEach((a) => segments.push(a.one_id));

  if (!segments.length)
    return {
      s: 0,
      m: "No Users Found !",
    };

  const result = await client.createNotification({
    app_id: config.ONESIGNAL_APP_ID,
    mutable_content: true,
    include_player_ids: segments,
    contents: {
      en: body,
    },
    headings: {
      en: title,
    },
    big_picture: image,
    android_sound: "notification_android",
    ios_sound: "notifiation_ios",
  });

  return result.id
    ? {
        s: 1,
        m: "Notification send successfully !",
      }
    : {
        s: 0,
        m: "Invalid Token!",
      };
};
