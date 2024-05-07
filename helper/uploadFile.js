import { extname } from "path";
import crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";

export const uploadFile = async (file, path) => {
  try {
    // retuen if file not exist
    if (!file) return null;

    var fileDetail = await fileTypeFromBuffer(file.data);

    //   get extensionName from file
    const extensionName = fileDetail.ext;

    //   create rendom file name
    const fileName =
      crypto.randomBytes(10).toString("hex") + "." + extensionName;

    //   create file path for upload
    const uploadPath = "./public/uploads/" + path + "/" + fileName;

    //   upload file in folder
    await file.mv(uploadPath);

    return "/public/uploads/" + path + "/" + fileName;
  } catch (error) {
    console.log(error);
    return error;
  }
};
