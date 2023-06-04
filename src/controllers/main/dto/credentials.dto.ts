import { IsDefined } from "class-validator";

export class Credentials {
  @IsDefined({ message: "No LOGIN" })
  readonly login: string;
  @IsDefined({ message: "No PASSWORD" })
  readonly password: string;
  readonly settings: Settings;
}

export type Settings = {
  minDelay?: number;
  maxDelay?: number;
  typos?: Typos;
  capitalWords?: CapitalWords;
  synonyms?: Synonyms;
};

type Typos = {
  enabled: boolean;
  chance: number;
};

type CapitalWords = {
  enabled: boolean;
  chance: number;
};

type Synonyms = {
  enabled: boolean;
  chance: number;
};
