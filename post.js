import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

export const uploadPicture = async (imageUri) => {
  try {
    const fileBlob = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const requestBody = new FormData();
    requestBody.append("image", {
      name: "upload.jpg",
      type: "image/jpg",
      uri:
        Platform.OS === "ios" ? `data:image/jpg;base64,${fileBlob}` : imageUri,
    });

    const response = await fetch(
      "https://d69f6cef-ba25-4337-97e1-3858fe50c704-00-2ece80a591llo.kirk.replit.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: requestBody,
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    return null;
  }
};
