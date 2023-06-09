import { Injectable } from "@nestjs/common";
import {
  getHomeworkSummaryValidator,
  getHomeworksValidator,
  saveHomeworkValidator,
} from "src/controllers/main/dto/homeworks.dto";
import {
  getHomeworkSummary,
  getHomeworks,
  saveHomework,
} from "src/scrapper/homeworks/homeworks.scrapper";

@Injectable()
export class HomeworksService {
  async getHomeworksService(getHomeworksValidator: getHomeworksValidator) {
    const phpsessid = getHomeworksValidator.phpsessid;
    try {
      return await getHomeworks(phpsessid);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async getHomeworkSummaryService(
    getHomeworkSummaryValidator: getHomeworkSummaryValidator
  ) {
    const { phpsessid, link } = getHomeworkSummaryValidator;
    try {
      return await getHomeworkSummary(phpsessid, link);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async saveHomeworkService(saveHomeworkValidator: saveHomeworkValidator) {
    const { phpsessid, link, exercise, response, action } =
      saveHomeworkValidator;
    try {
      return await saveHomework(phpsessid, link, exercise, response, action);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
