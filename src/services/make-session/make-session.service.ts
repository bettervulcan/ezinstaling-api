import { Injectable, ForbiddenException, Logger } from "@nestjs/common";
import axios from "axios";
import {
  Credentials,
  Settings,
} from "src/controllers/main/dto/credentials.dto";
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
import {
  getRndInteger,
  delay,
  introduceTypo,
  getSynonyms,
} from "src/utils/utils";

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

const makeSession = async (
  res: any,
  login: string,
  password: string,
  settings: Settings
) => {
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
    const modifiedWords = [];
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

      let answerExploit = await getAnswerExploit(question);

      // legit

      const { minDelay, maxDelay, typos, capitalWords, synonyms } = settings;
      let loopModified = false;
      if (!modifiedWords.includes(answerExploit)) {
        if (typos?.enabled) {
          if (Math.random() <= typos.chance) {
            modifiedWords.push(answerExploit);
            logger.verbose(`Typos for: ${answerExploit}`);
            answerExploit = await introduceTypo(answerExploit);
            loopModified = true;
          }
        }
        if (capitalWords?.enabled) {
          if (Math.random() <= capitalWords.chance) {
            modifiedWords.push(answerExploit);
            logger.verbose(`Capital letter for: ${answerExploit}`);
            answerExploit =
              answerExploit.charAt(0).toUpperCase() + answerExploit.slice(1);
            loopModified = true;
          }
        }
        if (synonyms?.enabled) {
          if (Math.random() <= synonyms.chance) {
            modifiedWords.push(answerExploit);
            logger.verbose(`Synonym for: ${answerExploit}`);
            answerExploit = await getSynonyms(answerExploit);
            loopModified = true;
          }
        }
      }

      let delayTime = 0;
      if (answerExploit) {
        delayTime =
          minDelay && maxDelay
            ? getRndInteger(minDelay, maxDelay) * answerExploit.length
            : getRndInteger(200, 330) * answerExploit.length;

        await delay(delayTime);
      }

      const fails = [
        "zła odpowiedź",
        "dobrze",
        "synonim",
        "zła wielkość liter",
        "literówka",
      ];

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
              `Answer: (${answerExploit}) for user: ${login}, wait (${Math.round(
                delayTime * 1.5
              )}ms)`
            );
            await writeUserData(
              login,
              `Uzupełniono  (${answerExploit}), czekam (${Math.round(
                delayTime * 1.5
              )}ms)`
            );
            break;
          default:
            logger.warn(
              `Answer: (${answerExploit}) for user: ${login} with (${
                fails[data.output.grade]
              }), wait (${Math.round(delayTime * 1.5)}ms)`
            );
            await writeUserData(
              login,
              `Uzupełniono (${answerExploit}) z błędem (${
                fails[data.output.grade]
              }), czekam (${Math.round(delayTime * 1.5)}ms)`
            );
            if (!loopModified) {
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
            }
            break;
        }
      });
      await delay(delayTime * 1.5);
    }
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
    const { login, password, settings } = credentials;
    if (
      settings?.minDelay < 150 ||
      settings?.maxDelay > 5000 ||
      settings.typos.chance > 0.25 ||
      settings.capitalWords.chance > 0.25 ||
      settings.synonyms.chance > 0.25
    ) {
      throw new ForbiddenException({
        success: false,
        message: "Minimum and maximum values",
        values: {
          minDelay: 150,
          maxDelay: 5000,
          typos: "chance < 0.25 (25%)",
          capitalWords: "chance < 0.25 (25%)",
          synonyms: "chance < 0.25 (25%)",
        },
      });
    }
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
      await makeSession(res, login, password, settings);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
