import { Injectable, ForbiddenException } from "@nestjs/common";
import { GenerateQuestion } from "src/controllers/main/dto/generate-question.dto";
import { generateQuestion } from "src/controllers/okhttp";
@Injectable()
export class GenerateQuestionService {
  async genQuestion(genQuestion: GenerateQuestion) {
    const { phpsessid, appid, studentid } = genQuestion;
    try {
      const status = await generateQuestion(phpsessid, appid, studentid);

      if (status.success != true) throw new ForbiddenException(status);
      return status;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
