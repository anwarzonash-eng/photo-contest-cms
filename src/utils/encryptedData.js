import { enc, AES } from 'crypto-js';
import Cookies from "js-cookie";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

export const decryptUserData = () => {
  const encryptedUserData = Cookies.get("PhotoContestCMS.");

  let decryptedUserData = {};

  if (encryptedUserData) {
    try {
      const decryptedBytes = AES.decrypt(encryptedUserData, secretKey);
      decryptedUserData = JSON.parse(decryptedBytes.toString(enc.Utf8));
    } catch (error) {
      console.error('Error decrypting or parsing user data:', error);
    }
  }

  return decryptedUserData;
};
