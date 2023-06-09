import { Injectable, ForbiddenException, Logger } from "@nestjs/common";
import axios from "axios";
import { Credentials } from "src/controllers/main/dto/credentials.dto";
import {
  generateQuestion,
  initSession,
  loginToInstaling,
  sendAnswer,
} from "src/controllers/okhttp";
import {
  getBan,
  getStatus,
  removeAllLogs,
  setStatus,
  writeUserData,
} from "src/firebase";
import { addWord, getAnswer } from "src/mongo";
import { getRndInteger, delay } from "src/utils/utils";

const logger = new Logger("MakeSession");

const getAnswerExploit = async (question) => {
  let answerExploit;
  if (await getAnswer(question.question.id)) {
    answerExploit = await getAnswer(question.question.id);
  } else {
    const exploit = await axios.get(
      `https://instaling.pl/ling2/server/actions/getAudioUrl.php?id=${question.question.id}`
    );

    const reg = /https:\/\/instaling\.pl\/mp3\/[0-9]+\//g;
    answerExploit = exploit.data.url.replaceAll(reg, "").replaceAll(".mp3", "");
  }

  return answerExploit;
};

const makeSession = async (res: any, login: string, password: string) => {
  try {
    const status = await getStatus(login);
    if (status.session) {
      logger.log(`The session for ${login} is currently on`);
      throw new ForbiddenException({
        success: false,
        message: "Sesja trwa",
      });
    }
    await removeAllLogs(login);
    const loginMethod = await loginToInstaling(login, password);
    if (!loginMethod.success) {
      await writeUserData(login, "Błąd podczas logowania");
      await setStatus(login, false);
      throw new ForbiddenException({
        success: false,
        message: "Błąd poczas logowania",
        error: loginMethod.message,
      });
    }
    setStatus(login, true);
    logger.log(`Session started for ${login}`);
    const { phpsessid, appid, studentid } = loginMethod;
    await initSession(phpsessid, appid, studentid);
    await writeUserData(login, "Inicjalizowanie sesji");
    res.status(200).send({ success: true, message: "Sesja jest wykonywana" });
    setTimeout(async () => {
      while (true) {
        const status = await getStatus(login);
        const question = await generateQuestion(phpsessid, appid, studentid);

        if (question.ended || !status.session) {
          if (!question.instalDays || !question.words || !question.correct) {
            logger.log(`End of session for: ${login} by admin`);
            await writeUserData(login, "Sesja przerwana przez administratora");
            setStatus(login, false);
            break;
          }

          logger.log(`End of session for: ${login}`);
          await writeUserData(login, "Sesja zakończona");
          setStatus(login, false);
          break;
        }

        const answerExploit = await getAnswerExploit(question);

        let delayTime = 0;
        if (answerExploit) {
          delayTime = getRndInteger(100, 200) * 2 * answerExploit.length;
          await delay(delayTime);
        }

        await sendAnswer(
          phpsessid,
          appid,
          studentid,
          question.question.id,
          answerExploit
        ).then(async (data) => {
          switch (data.output.grade) {
            case 1:
              logger.log(
                `Answer: (${answerExploit}) for user: ${login} in (${delayTime}ms)`
              );
              await writeUserData(
                login,
                `Rozwiązano: ${answerExploit} (w ${delayTime}ms)`
              );
              break;
            default:
              let word;
              if (data.output.hasOwnProperty("word")) {
                word = data.output.word;
              } else if (data.output.hasOwnProperty("answershow")) {
                word = data.output.answershow;
              }
              if (word) {
                await addWord(data.output.id, word)
                  .then(async () => {
                    await writeUserData(login, `Dodano słowo do bazy: ${word}`);
                  })
                  .catch(async (err) => {
                    logger.error(`Wystąpił problem z dodaniem słówka: ${err}`);
                    await writeUserData(
                      login,
                      `Wystąpił problem z dodaniem słówka: ${word}`
                    );
                  });
              }
              break;
          }
        });
        await delay(delayTime);
      }
    }, 0);
    return {
      success: true,
      message: "Sesja jest wykonywana",
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

@Injectable()
export class MakeSessionService {
  async doSession(credentials: Credentials, res: any) {
    const { login, password } = credentials;
    try {
      const banned = await getBan(login);
      if (banned) {
        const { reason } = banned;
        logger.log(`User ${login} is banned. Reason: ${reason}`);
        throw new ForbiddenException({
          success: false,
          login: login,
          reason: reason,
          message: "User banned",
        });
      }
      await makeSession(res, login, password);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
