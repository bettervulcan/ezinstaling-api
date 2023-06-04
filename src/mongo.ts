import mongoose from "mongoose";
import { WordModel } from "./models/word";
import { mongodb } from "./config";
import { Logger } from "@nestjs/common";

const logger = new Logger("MongoDB");
async function setupMongo(): Promise<void> {
  try {
    await mongoose.connect(mongodb.url);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
    throw error;
  }
  try {
    await WordModel.init();
  } catch (error) {
    logger.error(`Word model initialization error: ${error}`);
    throw error;
  }

  logger.log("Successfuly connected to MongoDB && Word model initialized");
}

const addWord = async (questionId: string, answer: string) => {
  try {
    if (mongoose.connection.readyState !== 1)
      throw new Error("Database is not available");
    const isExist = await getAnswer(questionId);
    if (isExist) {
      logger.warn(`${answer} is already in database`);
      return isExist;
    }
    await WordModel.create({ questionId, answer });
    logger.log(
      `New word has been added to mongoDB: ${answer} with id: ${questionId}`
    );
    return { questionId, answer };
  } catch (error) {
    logger.error(`Error while adding new word: ${error}`);
    throw error;
  }
};

const getAnswer = async (questionId: string): Promise<string | null> => {
  try {
    if (mongoose.connection.readyState !== 1)
      throw new Error("Database is not available");
    const word = await WordModel.findOne({ questionId });
    return word ? word.answer : null;
  } catch (error) {
    logger.error(`Error while getting answer: ${error}`);
    throw error;
  }
};

export { setupMongo, addWord, getAnswer };
