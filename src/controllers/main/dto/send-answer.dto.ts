import { IsNotEmpty } from "class-validator";

export class SendAnswer {
  @IsNotEmpty()
  readonly phpsessid: string;
  @IsNotEmpty()
  readonly appid: string;
  @IsNotEmpty()
  readonly studentid: string;
  @IsNotEmpty()
  readonly questionid: string;
  @IsNotEmpty()
  readonly answer: string;
}
