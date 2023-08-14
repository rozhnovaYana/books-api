import mongoose, { HydratedDocument, Types } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const { Schema } = mongoose;

export interface IUser {
  name: string;
  login: string;
  password: string;
  books: mongoose.Types.Array<{
    id: mongoose.Types.ObjectId;
    isFavourite: boolean;
    status: String;
  }>;
}

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
  books: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      isFavourite: Boolean,
      status: String,
    },
  ],
});
userSchema.plugin(uniqueValidator);

export default mongoose.model<IUser>("User", userSchema);
