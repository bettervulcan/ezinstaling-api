import { Injectable } from "@nestjs/common";
import { QuestionID } from "src/controllers/main/dto/get-answer.dto";
import { getAnswer } from "src/mongo";
import axios from "axios";
@Injectable()
export class GetAnswerService {
  async getAnswer(id: QuestionID) {
    try {
      let answerExploit;
      if (await getAnswer(id.question)) {
        answerExploit = await getAnswer(id.question);
      } else {
        const exploit = await axios.get(
          `https://instaling.pl/ling2/server/actions/getAudioUrl.php?id=${id}`
        );

        const reg = /https:\/\/instaling\.pl\/mp3\/[0-9]+\//g;
        answerExploit = exploit.data.url
          .replaceAll(reg, "")
          .replaceAll(".mp3", "");
      }

      return {
        success: true,
        message: "Successfully got answer",
        answer: answerExploit,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
