import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IBook {
  id: string;
  author: string;
  title: string;
  description?: string;
  cover?: string;
  pages?: number;
  release_date?: string;
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
  description: String,
  cover: String,
  pages: Number,
  release_date: Date,
});

export default mongoose.model<IBook>("Book", bookSchema);
