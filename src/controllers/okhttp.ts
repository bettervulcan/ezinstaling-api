import { RequestBuilder, FormEncodingBuilder } from "okhttp";
import parse from "node-html-parser";
import { Logger } from "@nestjs/common";

const logger = new Logger("OkHTTP");
const mozillaUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.125 Safari/537.36";

function loginToInstaling(email: string, password: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    new RequestBuilder()
      .url("https://instaling.pl/teacher.php?page=teacherActions")
      .header("Content-Type", "application/x-www-form-urlencoded")
      .header("User-Agent", mozillaUserAgent)
      .POST(
        new FormEncodingBuilder()
          .add("action", "login")
          .add("log_email", email)
          .add("log_password", password)
          .build()
      )
      .buildAndExecute()
      .then((loginOutput) => {
        if (
          !loginOutput.response.headers["location"].startsWith(
            "learning/dispatcher"
          )
        ) {
          return resolve({
            success: false,
            message: "Login Failed",
          });
        }
        const phpsessid =
          loginOutput.response.headers["set-cookie"][0].split(";")[0];
        new RequestBuilder()
          .GET("https://instaling.pl/learning/dispatcher.php")
          .header("User-Agent", mozillaUserAgent)
          .header("Cookie", phpsessid)
          .buildAndExecute()
          .then((dispatcherOutput) => {
            let appid = "app=app_84";
            if (dispatcherOutput.response.headers["set-cookie"]) {
              appid =
                dispatcherOutput.response.headers["set-cookie"][0].split(
                  ";"
                )[0];
            }
            const studentid =
              dispatcherOutput.response.headers["location"].split("?")[1];
            new RequestBuilder()
              .GET(
                `https://instaling.pl/student/pages/mainPage.php?${studentid}`
              )
              .header("User-Agent", mozillaUserAgent)
              .header("Cookie", phpsessid + "; ")
              .buildAndExecute()
              .then((mainOutput) => {
                const document = parse(mainOutput.data);
                const buttonText = document.querySelector(".sesion").innerText;
                let todaySessionCompletedBool = false;
                const todaySessionCompleted = document.querySelector(
                  "#student_panel > h4"
                );
                const instalingversion = document.querySelector(
                  "#footer > div > p.span4.text-center"
                ).innerText;
                const splitedInstalingVersion = instalingversion.split(" ")[1];

                const homeworkCount = document
                  .querySelector(
                    "#student_panel > div.alert.alert-info > strong"
                  )
                  ?.text?.trim()
                  ?.split(":")[1]
                  ?.replace(" ", "");

                if (todaySessionCompleted) todaySessionCompletedBool = true;
                resolve({
                  success: true,
                  message: "Login Successfully",
                  phpsessid,
                  appid,
                  studentid,
                  buttonText,
                  todaySessionCompleted: todaySessionCompletedBool,
                  instalingVersion: splitedInstalingVersion,
                  homeworkCount,
                });
              });
          })
          .catch((err) => {
            logger.error(`Caught error in OKHTTP: ${err}`);
            reject(err);
          });
      })
      .catch((err) => {
        logger.error(`Caught error in OKHTTP: ${err}`);
        reject(err);
      });
  }).catch((err) => {
    logger.error(`Caught error in OKHTTP: ${err}`);
  });
}

function phpsessidValidation(
  phpsessid: string
): Promise<{ success: boolean; message: string; phpsessid?: string }> {
  return new Promise((resolve, reject) => {
    new RequestBuilder()
      .GET("https://instaling.pl/learning/dispatcher.php")
      .header("User-Agent", mozillaUserAgent)
      .header("Cookie", phpsessid)
      .buildAndExecute()
      .then((dispatcherOutput) => {
        if (
          dispatcherOutput.response.headers["location"].includes("logout.php")
        ) {
          resolve({ success: false, message: "Validation Failed" });
        } else {
          resolve({
            success: true,
            message: "Validation Successfully",
            phpsessid,
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getSessionStatus(phpsessid: string): Promise<{
  success: boolean;
  message: string;
  sessionStatus?: string;
  todaySessionCompleted?: boolean;
}> {
  return new Promise((resolve, reject) => {
    new RequestBuilder()
      .GET("https://instaling.pl/learning/dispatcher.php")
      .header("User-Agent", mozillaUserAgent)
      .header("Cookie", phpsessid)
      .buildAndExecute()
      .then((dispatcherOutput) => {
        if (
          !dispatcherOutput.response.headers["location"].includes(
            "student/pages/mainPage"
          )
        ) {
          return resolve({
            success: false,
            message: "Login Failed",
          });
        }
        let appid = "";
        if (dispatcherOutput.response.headers["set-cookie"]) {
          appid =
            dispatcherOutput.response.headers["set-cookie"][0].split(";")[0];
        }
        const studentid =
          dispatcherOutput.response.headers["location"].split("?")[1];
        new RequestBuilder()
          .GET(`https://instaling.pl/student/pages/mainPage.php?${studentid}`)
          .header("User-Agent", mozillaUserAgent)
          .header("Cookie", phpsessid + "; " + appid)
          .buildAndExecute()
          .then((mainOutput) => {
            const document = parse(mainOutput.data);
            const buttonText = document.querySelector(".sesion").innerText;
            let todaySessionCompletedBool = false;
            const todaySessionCompleted = document.querySelector(
              "#student_panel > h4"
            );
            if (todaySessionCompleted) todaySessionCompletedBool = true;
            resolve({
              success: true,
              message: "Login Successfully",
              sessionStatus: buttonText,
              todaySessionCompleted: todaySessionCompletedBool,
            });
          });
      })
      .catch((err) => {
        logger.error(`Caught error in OKHTTP: ${err}`);
        reject(err);
      });
  });
}

function initSession(
  phpsessid: string,
  appid: string,
  studentid: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    let processedstudentid = studentid;
    if (studentid.includes("=")) {
      processedstudentid = studentid.split("=")[1];
    }
    new RequestBuilder()
      .url("https://instaling.pl/ling2/server/actions/init_session.php")
      .header("Content-Type", "application/x-www-form-urlencoded")
      .header("User-Agent", mozillaUserAgent)
      .header("Cookie", phpsessid + "; " + appid)
      .POST(
        new FormEncodingBuilder()
          .add("child_id", processedstudentid)
          .add("repeat", "")
          .add("start", "")
          .add("end", "")
          .build()
      )
      .buildAndExecute()
      .then((initOutput) => {
        const init = JSON.parse(initOutput.data);
        resolve(init);
      })
      .catch((err) => {
        logger.error(`Caught error in OKHTTP: ${err}`);
        reject(err);
      });
  }).catch((err) => {
    logger.error(`Caught error in OKHTTP: ${err}`);
  });
}

function generateQuestion(
  phpsessid: string,
  appid: string,
  studentid: string
): Promise<any> {
  return new Promise((resolve) => {
    let processedstudentid = studentid;
    if (studentid.includes("=")) {
      processedstudentid = studentid.split("=")[1];
    }
    new RequestBuilder()
      .url("https://instaling.pl/ling2/server/actions/generate_next_word.php")
      .header("Content-Type", "application/x-www-form-urlencoded")
      .header("User-Agent", mozillaUserAgent)
      .header("Cookie", `${phpsessid}; ${appid}`)
      .POST(
        new FormEncodingBuilder()
          .add("child_id", processedstudentid)
          .add("date", Date.now().toString())
          .build()
      )
      .buildAndExecute()
      .then((generateOutput) => {
        const question = JSON.parse(generateOutput.data);
        if (question.hasOwnProperty("id")) {
          resolve({ ended: false, question, success: true });
        } else {
          try {
            const instalDays = question.summary
              .split("\\n\\n")[0]
              .split(": ")[1]
              .split("\\n")[0];
            const words = question.summary
              .split("\\n\\n")[1]
              .replace("\n", "")
              .split(",")[0]
              .split(" ")[1];
            const correct = question.summary
              .split("\\n\\n")[1]
              .replace("\n", "")
              .split(",")[1]
              .split(" ")[1];
            resolve({ ended: true, instalDays, words, correct, success: true });
          } catch (error) {
            resolve({
              ended: true,
              instalDays: -1,
              words: -1,
              correct: -1,
              success: true,
            });
          }
        }
      })
      .catch((err) => {
        resolve({
          success: false,
          message:
            "The question could not be generated, is the data entered correct?",
          error: err.message,
        });
      });
  }).catch((err) => {
    logger.error(`Caught error in OKHTTP: ${err}`);
  });
}

function sendAnswer(
  phpsessid: string,
  appid: string,
  studentid: string,
  questionid: string,
  answer: string
): Promise<any> {
  return new Promise((resolve) => {
    let processedstudentid = studentid;
    if (studentid.includes("=")) {
      processedstudentid = studentid.split("=")[1];
    }
    new RequestBuilder()
      .url("https://instaling.pl/ling2/server/actions/save_answer.php")
      .header("Content-Type", "application/x-www-form-urlencoded")
      .header("User-Agent", mozillaUserAgent)
      .header("Cookie", `${phpsessid}; ${appid}`)
      .POST(
        new FormEncodingBuilder()
          .add("child_id", processedstudentid)
          .add("answer", answer)
          .add("word_id", questionid)
          .add("version", "C65E24B29F60B1231EC23D979C9707D2")
          .build()
      )
      .buildAndExecute()
      .then(async (answerOutput) => {
        const answerJ = JSON.parse(answerOutput.data);

        resolve({ output: answerJ, success: true });
      })
      .catch((err) => {
        resolve({
          message: "Does this user have an active session?",
          success: false,
          error: err.message,
        });
      });
  }).catch((err) => {
    logger.error(`Caught error in OKHTTP: ${err}`);
  });
}

export {
  loginToInstaling,
  getSessionStatus,
  initSession,
  generateQuestion,
  sendAnswer,
  phpsessidValidation,
};
