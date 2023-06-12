import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const { Schema } = mongoose;

export interface IBook {
  id: string;
  rating: number;
  pages: number;
}
export interface IUser {
  name: string;
  login: string;
  password: string;
  books?: IBook[];
}

const bookSchema = new Schema({
  id: String,
  rating: Number,
  pages: Number,
});

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  login: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  books: [bookSchema],
});
userSchema.plugin(uniqueValidator);

export default mongoose.model<IUser>("User", userSchema);
