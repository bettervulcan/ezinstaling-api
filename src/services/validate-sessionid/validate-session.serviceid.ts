import { Injectable, ForbiddenException } from "@nestjs/common";
import { PHPSessionID } from "../../controllers/main/dto/validate-sessionid.dto";
import { phpsessidValidation } from "../../controllers/okhttp";

@Injectable()
export class ValidateSessionService {
  async validateSessionID(phpsessionid: PHPSessionID) {
    const phpsessid = phpsessionid.phpsessid;

    try {
      const status = await phpsessidValidation(phpsessid);
      if (status.message != "Validation Successfully")
        throw new ForbiddenException(status);
      else return status;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
