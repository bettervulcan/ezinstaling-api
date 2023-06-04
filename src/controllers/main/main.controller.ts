import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  ValidationPipe,
  UsePipes,
  Res,
} from "@nestjs/common";
import { ValidateSessionService } from "src/services/validate-sessionid/validate-session.serviceid";
import { PHPSessionID } from "./dto/validate-sessionid.dto";
import { CheckAccountService } from "src/services/check-account/check-account.service";
import { Credentials } from "./dto/credentials.dto";
import { GetAnswerService } from "src/services/get-answer/get-answer.service";
import { QuestionID } from "./dto/get-answer.dto";
import { ApiStatusService } from "src/services/api-status/api-status.service";
import { GenerateQuestionService } from "src/services/generate-question/generate-question.service";
import { GenerateQuestion } from "./dto/generate-question.dto";
import { SendAnswerService } from "src/services/send-answer/send-answer.service";
import { SendAnswer } from "./dto/send-answer.dto";
import { CheckSessionService } from "src/services/check-session/check-session.service";
import { MakeSessionService } from "src/services/make-session/make-session.service";
import { UsersCountService } from "src/services/users-count/users-count.service";
import { SigninEmailService } from "src/services/signin-email/signin-email.service";
import { Email } from "./dto/email.dto";

@Controller("/")
export class MainController {
  constructor(private readonly apiStatusService: ApiStatusService) {}

  @Get()
  @HttpCode(200)
  api() {
    return this.apiStatusService.status();
  }
}

@Controller("api/v1/")
export class InstalingController {
  constructor(
    private readonly validateSessionService: ValidateSessionService,
    private readonly checkAccountService: CheckAccountService,
    private readonly getAnswerService: GetAnswerService,
    private readonly generateQuestionService: GenerateQuestionService,
    private readonly sendAnswerService: SendAnswerService,
    private readonly checkSessionService: CheckSessionService,
    private readonly makeSessionService: MakeSessionService,
    private readonly userCountService: UsersCountService,
    private readonly signInEmailService: SigninEmailService
  ) {}

  @Post("instaling/validate-sessionid")
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  validateSessionID(@Body() phpsessid: PHPSessionID) {
    return this.validateSessionService.validateSessionID(phpsessid);
  }

  @Post("instaling/checkaccount")
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  checkAccount(@Body() credentials: Credentials) {
    return this.checkAccountService.checkAccount(credentials);
  }

  @Post("instaling/generatequestion")
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  generateQuestion(@Body() generateQuestion: GenerateQuestion) {
    return this.generateQuestionService.genQuestion(generateQuestion);
  }

  @Post("instaling/sendanswer")
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  sendAnswer(@Body() answer: SendAnswer) {
    return this.sendAnswerService.sendAns(answer);
  }

  @Post("instaling/checksession")
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  checkSession(@Body() phpsessid: PHPSessionID) {
    return this.checkSessionService.checkSession(phpsessid);
  }

  @Post("instaling/makesession")
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  makeSession(@Body() credentials: Credentials, @Res() res: Response) {
    return this.makeSessionService.doSession(credentials, res);
  }
  @Post("signin-email")
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  signIn(@Body() data: Email) {
    return this.signInEmailService.signIn(data);
  }

  @Get("instaling/getanswer")
  @UsePipes(new ValidationPipe())
  getAnswer(@Query("id") id: QuestionID) {
    return this.getAnswerService.getAnswer(id);
  }
  @Get("users")
  getUsersCount() {
    return this.userCountService.getUsersCount();
  }
}
