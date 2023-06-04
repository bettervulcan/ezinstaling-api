import mongoose, { Schema, Model } from "mongoose";

interface Word {
  questionId: number;
  answer: string;
}

const WordSchema: Schema = new mongoose.Schema<Word>({
  questionId: { type: Number, required: true },
  answer: { type: String, required: true },
});

const WordModel: Model<Word> = mongoose.model<Word>("Word", WordSchema);

export { WordModel };
