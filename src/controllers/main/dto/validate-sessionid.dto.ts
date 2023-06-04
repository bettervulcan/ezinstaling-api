import { IsNotEmpty } from "class-validator";

export class PHPSessionID {
  @IsNotEmpty()
  readonly phpsessid: string;
}
