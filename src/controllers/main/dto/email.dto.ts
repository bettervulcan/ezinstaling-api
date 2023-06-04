import { IsNotEmpty } from "class-validator";

export class Email {
  @IsNotEmpty()
  readonly login: string;
  @IsNotEmpty()
  readonly password: string;
  @IsNotEmpty()
  readonly email: string;
}
