import { IsNotEmpty } from "class-validator";

export class QuestionID {
  @IsNotEmpty()
  readonly question: string;
}
