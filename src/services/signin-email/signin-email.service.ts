import { Injectable } from "@nestjs/common";
import { Email } from "src/controllers/main/dto/email.dto";
import { setEmailAdress } from "src/firebase";
import { loginToInstaling } from "src/controllers/okhttp";
@Injectable()
export class SigninEmailService {
  async signIn(data: Email) {
    try {
      const isValid = await loginToInstaling(data.login, data.password);
      if (isValid.success) {
        const res = await setEmailAdress(data.login, data.email);
        return res;
      } else {
        return {
          success: false,
          message: "We could not verify if the account belongs to you",
        };
      }
    } catch (err) {
      throw err;
    }
  }
}
