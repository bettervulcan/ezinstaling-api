import { IsNotEmpty } from "class-validator";

export class GenerateQuestion {
  @IsNotEmpty()
  readonly phpsessid: string;
  @IsNotEmpty()
  readonly appid: string;
  @IsNotEmpty()
  readonly studentid: string;
}
