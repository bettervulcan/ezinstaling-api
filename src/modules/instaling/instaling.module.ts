import { Module } from "@nestjs/common";
import { InstalingController } from "src/controllers/main/main.controller";
import { CheckAccountService } from "src/services/check-account/check-account.service";
import { GetAnswerService } from "src/services/get-answer/get-answer.service";
import { ValidateSessionService } from "src/services/validate-sessionid/validate-session.serviceid";
import { GenerateQuestionService } from "src/services/generate-question/generate-question.service";
import { SendAnswerService } from "src/services/send-answer/send-answer.service";
import { CheckSessionService } from "src/services/check-session/check-session.service";
import { MakeSessionService } from "src/services/make-session/make-session.service";
import { UsersCountService } from "src/services/users-count/users-count.service";
import { SigninEmailService } from "src/services/signin-email/signin-email.service";

@Module({
  imports: [],
  controllers: [InstalingController],
  providers: [
    ValidateSessionService,
    GenerateQuestionService,
    CheckAccountService,
    GetAnswerService,
    SendAnswerService,
    CheckSessionService,
    MakeSessionService,
    UsersCountService,
    SigninEmailService,
  ],
})
export class InstalingModule {}
