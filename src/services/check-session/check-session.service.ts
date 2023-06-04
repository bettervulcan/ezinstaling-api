import { Injectable, ForbiddenException } from "@nestjs/common";
import { PHPSessionID } from "src/controllers/main/dto/validate-sessionid.dto";
import { getSessionStatus } from "src/controllers/okhttp";
@Injectable()
export class CheckSessionService {
  async checkSession(phpsessid: PHPSessionID) {
    try {
      const session = await getSessionStatus(phpsessid.phpsessid);
      if (session.success != true) throw new ForbiddenException(session);
      return session;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
