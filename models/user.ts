import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const { Schema } = mongoose;

const bookSchema = new Schema({
  id: String,
  rating: Number,
  pages: Number,
});

const userSchema = new Schema({
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

export default mongoose.model("User", userSchema);
