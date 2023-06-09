import { IsNotEmpty } from "class-validator";

export class getHomeworksValidator {
  @IsNotEmpty()
  readonly phpsessid: string;
}

export class getHomeworkSummaryValidator {
  @IsNotEmpty()
  readonly phpsessid: string;
  @IsNotEmpty()
  readonly link: string;
}

export class saveHomeworkValidator {
  @IsNotEmpty()
  readonly phpsessid: string;
  @IsNotEmpty()
  readonly link: string;
  @IsNotEmpty()
  readonly exercise: string;
  @IsNotEmpty()
  readonly response: string;
  @IsNotEmpty()
  readonly action: string;
}
