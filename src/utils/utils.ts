import { Configuration, OpenAIApi } from "openai";
import { base } from "src/config";
import axios from "axios";
const configuration = new Configuration({
  apiKey: base.openaiApiKey,
});

const openai = new OpenAIApi(configuration);

const getRndInteger = (min: number, max: number): number => {
  const firstTry = Math.floor(Math.random() * (max - min + 1)) + min;
  const secTry = Math.floor(Math.random() * (max - min + 1)) + min;
  const thirdTry = Math.floor(Math.random() * (max - min + 1)) + min;
  return (firstTry + secTry + thirdTry) / 3;
};

const delay = (delayInms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

function removeSpecialChars(str: string): string {
  return str.replace(/[^\w\s.@\n]/gi, "");
}

const introduceTypo = async (word: string) => {
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 512,
      prompt: `Enter a natural typo in the word: ${word}, ur response will look: {"typo": <typo of word>}`,
    });
    const typo = JSON.parse(
      completion.data.choices[0].text.replace(/[.\n]/g, "")
    );
    return typo.typo ? typo.typo : word;
  } catch (e) {
    return word;
  }
};

const getSynonyms = async (word: string) => {
  try {
    const response = await axios.get("https://api.datamuse.com/words", {
      params: {
        rel_syn: word,
        max: 1,
      },
    });
    if (response.data.length > 0) {
      return response.data[0].word;
    } else {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        max_tokens: 512,
        prompt: `detect language of given word and give only one synonym for this word. ur response will look like json format: {"language": <detected language>, "synonym": <synonym of given word in detected language>} word: ${word}`,
      });
      const synonym = JSON.parse(
        completion.data.choices[0].text.replace(/[.\n]/g, "")
      );
      return synonym.synonym ? synonym.synonym : word;
    }
  } catch (e) {
    return word;
  }
};

export { getRndInteger, delay, removeSpecialChars, introduceTypo, getSynonyms };
