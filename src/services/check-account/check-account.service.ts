import { ForbiddenException, Injectable } from "@nestjs/common";
import { getBan } from "../../firebase";
import { loginToInstaling } from "../../controllers/okhttp";
import { Credentials } from "../../controllers/main/dto/credentials.dto";

@Injectable()
export class CheckAccountService {
  async checkAccount(credentials: Credentials) {
    const { password, login } = credentials;

    try {
      const banned = await getBan(login);
      if (banned) {
        const { reason } = banned;
        throw new ForbiddenException({
          success: false,
          login: login,
          reason: reason,
          message: "User banned",
        });
      }

      const account = await loginToInstaling(login, password);
      if (account.success != true) throw new ForbiddenException(account);
      return account;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
