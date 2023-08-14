import mongoose, { Types } from "mongoose";

const { Schema } = mongoose;

export interface IUser {
  id: Types.ObjectId;
}
export interface IBook {
  author: string;
  title: string;
  description?: string;
  cover?: string;
  pages?: number;
  release_date?: string;
  rating: {
    score: number;
    reviews: {
      id: mongoose.Types.ObjectId;
      score: number;
    }[];
  };
  users: mongoose.Types.ObjectId[];
  isbn: string;
}
const bookSchema = new Schema<IBook>({
  author: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  isbn: String,
  description: String,
  cover: String,
  pages: Number,
  release_date: Date,
  rating: {
    score: Number,
    reviews: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        score: Number,
      },
    ],
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export default mongoose.model<IBook>("Book", bookSchema);
