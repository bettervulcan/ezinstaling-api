import { Injectable, ForbiddenException } from "@nestjs/common";
import { SendAnswer } from "src/controllers/main/dto/send-answer.dto";
import { sendAnswer } from "src/controllers/okhttp";
@Injectable()
export class SendAnswerService {
  async sendAns(answerDto: SendAnswer) {
    const { phpsessid, appid, studentid, questionid, answer } = answerDto;
    try {
      const status = await sendAnswer(
        phpsessid,
        appid,
        studentid,
        questionid,
        answer
      );

      if (status.success != true) throw new ForbiddenException(status);
      return status;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
