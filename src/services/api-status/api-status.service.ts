import { Injectable } from "@nestjs/common";
import packageJson from "../../../package.json";

@Injectable()
export class ApiStatusService {
  status() {
    return {
      success: true,
      message: "API Server is available",
      version: packageJson.version,
      endpoints: {
        "/api/v1/instaling/checkaccount": {
          desc: "Downloads Instaling account data",
          method: "POST",
          body: {
            login: "Login",
            password: "Password",
          },
          response: {
            success: true,
            message: "Login Successfully",
            phpsessid: "PHPSESSID=?",
            appid: "app=?",
            studentid: "student_id=?",
            buttonText: "Dokończ sesję",
            todaySessionCompleted: true,
          },
        },
        "/api/v1/instaling/checksession": {
          desc: "Checks whether today's session has been executed through PHPSESSID",
          method: "POST",
          body: {
            phpsessid: "PHPSESSID from /checkaccount",
          },
          response: {
            success: true,
            message: "Login Successfully",
            sessionStatus: "Zacznij codzienną sesję",
            todaySessionCompleted: true,
          },
        },
        "/api/v1/instaling/makesession": {
          desc: "Automatically executes a session with a single request",
          method: "POST",
          body: {
            login: "Login",
            password: "Password",
          },
          response: {
            success: true,
            message: "Sesja jest wykonywana",
          },
        },
        "/api/v1/instaling/validate-sessionid": {
          desc: "It checks whether the PHPSESSID is still valid, as it can expire, and generates a new one",
          method: "POST",
          body: {
            phpsessid: "PHPSESSID from /checkaccount",
          },
          response: {
            success: true,
            message: "Validation Successfully",
            phpsessid: "PHPSESSID=3m3ur08vh6pso1ffquo4qnggr9",
          },
        },
        "/api/v1/instaling/generatequestion": {
          desc: "Generates a question for a given account",
          method: "POST",
          body: {
            phpsessid: "PHPSESSID from /checkaccount",
            appid: "APPID from /checkaccount",
            studentid: "STUDENTID from /checkaccount",
          },
          response: {
            ended: false,
            question: {
              id: "237931",
              speech_part: "wyrażenie",
              usage_example:
                "You can't order the product if you haven't typed in your ____ _______.",
              difficulty: "9999",
              translations: "adres domowy",
              kategoria: "",
              teacher_id: null,
              is_closed: "",
              exp_easier_count: null,
              language_id: "1",
              meaning: null,
              xls_id: null,
              article: "",
              ling_state: "",
              ling_comment: "",
              adult_only: "",
              cefr: "",
              cefr_approx: "",
              audio_file_available: "1",
              global_id: null,
              public: "1",
              essential: "",
              translation_from_id: null,
              type: "word",
              has_audio: "1",
              is_new_word: "",
              maxWords: 8,
            },
            success: true,
          },
        },
        "/api/v1/instaling/getanswer?id=237931": {
          desc: "You get an answer to a given question",
          method: "GET",
          details: {
            id: "Question ID from /generatequestion",
          },
          response: {
            success: true,
            message: "Successfully got answer",
            answer: "home address",
          },
        },
        "/api/v1/instaling/sendanswer": {
          desc: "Sends a response for execution",
          method: "POST",
          body: {
            phpsessid: "PHPSESSID from /checkaccount",
            appid: "APPID from /checkaccount",
            studentid: "STUDENTID from /checkaccount",
            questionid: "Question ID from /generatequestion",
            answer: "Question answer",
            login: "Login of account",
          },
          response: {
            output: {
              id: "237931",
              word: "home address",
              speech_part: "wyrażenie",
              usage_example:
                "You can't order the product if you haven't typed in your home address.",
              translations: "adres domowy",
              kategoria: "",
              teacher_id: null,
              is_closed: "",
              exp_easier_count: null,
              language_id: "1",
              meaning: null,
              xls_id: null,
              article: "",
              ling_state: "",
              ling_comment: "",
              adult_only: "",
              cefr: "",
              cefr_approx: "",
              audio_file_available: "1",
              audio_filename: "home address.mp3",
              global_id: null,
              public: "1",
              essential: "",
              translation_from_id: null,
              grade: 1,
              has_audio: "1",
              answershow: "home address",
            },
            success: true,
          },
        },
      },
    };
  }
}
