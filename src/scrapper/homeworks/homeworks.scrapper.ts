import { RequestBuilder, FormEncodingBuilder } from "okhttp";
import parse from "node-html-parser";
import { Logger } from "@nestjs/common";

const logger = new Logger("Homeworks Scrapper");
const mozillaUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.125 Safari/537.36";

function getHomeworks(phpsessid) {
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
          .GET(
            `https://instaling.pl/learning/choose_homework.php?id=${
              studentid.split("=")[1]
            }&list=true`
          )
          .header("User-Agent", mozillaUserAgent)
          .header("Cookie", phpsessid + "; " + appid)
          .buildAndExecute()
          .then((mainOutput) => {
            const root = parse(mainOutput.data);
            const tableRows = root.querySelectorAll(".homework_table_row");

            const result = {
              success: true,
              homeworksTodo: [],
              homeworksDone: [],
            };

            tableRows.forEach((row) => {
              const title = row.querySelector("a").text.trim();
              const deadline = row.querySelector(".homework_table_cell").text;
              const homeworkLink = row.querySelector("a").getAttribute("href");
              const gradeCell = row.querySelector(
                ".homework_table_cell:last-child"
              );

              if (gradeCell) {
                let grade = gradeCell.text;
                if (grade.length == 0) {
                  grade = "Brak oceny";
                }
                result.homeworksDone.push({
                  title,
                  deadline,
                  homeworkLink,
                  grade,
                });
              } else {
                result.homeworksTodo.push({
                  title,
                  deadline,
                  homeworkLink,
                });
              }
            });

            resolve(result);
          })
          .catch(() => {
            resolve({
              success: false,
              message:
                "PHPSessionID does not match the job link (studentid does not match)",
            });
          });
      })
      .catch((err) => {
        console.error(`Caught error in OKHTTP: ${err}`);
        reject(err);
      });
  });
}

function getHomeworkSummary(phpsessid, link) {
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
        new RequestBuilder()
          .GET(`https://instaling.pl/learning/${link}`)
          .header("User-Agent", mozillaUserAgent)
          .header("Cookie", phpsessid)
          .buildAndExecute()
          .then((mainOutput) => {
            const root = parse(mainOutput.data);
            const title = root
              ?.querySelector("h3")
              ?.innerText.trim()
              ?.split(":")[1];
            const deadline = root
              ?.querySelector("h5")
              ?.innerText?.trim()
              ?.split("Termin: ")[1];
            const exercise = root
              ?.querySelector('textarea[name="exercise"]')
              ?.innerText.trim();
            const ytLink = root
              ?.querySelector("iframe.youtube-film")
              ?.getAttribute("src")
              ?.trim();
            const answer = root
              .querySelector('textarea[name="student_response"]')
              .innerText.trim();
            const note = root
              ?.querySelector('textarea[name="teacher_response"]')
              ?.getAttribute("placeholder")
              ?.trim();
            const grade = root
              ?.querySelector('input[name="grade"]')
              ?.getAttribute("value")
              ?.trim();

            const done = root?.querySelector(
              "#account_page > div.alert.alert-error"
            )?.text;

            const output = {
              success: true,
              title: title,
              deadline: deadline,
              done: done ? false : true,
              details: {
                exercise,
                ytLink: ytLink,
                answer: answer,
                note: note,
                grade: grade?.length > 0 ? grade : "Brak oceny",
              },
            };

            resolve(JSON.stringify(output, null, 2));
          })
          .catch(() => {
            resolve({
              success: false,
              message:
                "PHPSessionID does not match the job link (studentid does not match)",
            });
          });
      })
      .catch((err) => {
        console.error(`Caught error in OKHTTP: ${err}`);
        reject(err);
      });
  });
}

function saveHomework(phpsessid, link, exercise, response, action) {
  return new Promise((resolve) => {
    const params = new URLSearchParams(link.split("?")[1]);
    const student_id = params.get("id");
    const homework_id = params.get("homework_id");

    new RequestBuilder()
      .url("https://instaling.pl/learning/editStudentHomework.php")
      .header("Content-Type", "application/x-www-form-urlencoded")
      .header("User-Agent", mozillaUserAgent)
      .header("Cookie", phpsessid)
      .POST(
        new FormEncodingBuilder()
          .add("studentHomeworkID", homework_id)
          .add("id", student_id)
          .add("exercise", exercise)
          .add("student_response", response)
          .add(action, action == "save" ? "Zapisz" : "")
          .build()
      )
      .buildAndExecute()
      .then(async () => {
        resolve({ message: "Successfully edited response", success: true });
      })
      .catch((err) => {
        resolve({
          success: false,
          error: err.message,
        });
      });
  }).catch((err) => {
    logger.error(`Caught error in OKHTTP: ${err}`);
  });
}

// saveHomework(
//   "PHPSESSID=7a5oe02riug8g686br6960uggf",
//   "homeworkPage.php?id=2134140&homework_id=18496",
//   "test platformy 4",
//   "test3",
//   "save"
// );

// getHomeworks("PHPSESSID=7a5oe02riug8g686br6960uggf").then((res) => {
//   console.log(res);
// });
// getHomeworks("PHPSESSID=4qheedj4rg93qfdun8hoetfaj2").then((res) => {
//   console.log(res);
// });

// getHomeworkSummary(
//   "PHPSESSID=7a5oe02riug8g686br6960uggf",
//   "homeworkPage.php?id=2134140&homework_id=18496"
// );

export { getHomeworkSummary, getHomeworks, saveHomework };
