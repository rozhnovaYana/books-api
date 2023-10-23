import mongoose, { HydratedDocument } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import HttpError from "../models/http-error";

import Book, { IBook } from "../models/book";
import User, { IUser } from "../models/user";

export const getBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let books: HydratedDocument<IBook>[] | null = [];
  try {
    for await (const book of Book.find()) {
      books.push(book.toObject({ getters: true }));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }
  res.json({
    books,
  });
};
export const getUserBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userID = req.params.uid;
  const user = await User.findById(userID);
  if (!user) {
    return next(new HttpError("Could not find user", 500));
  }
  let books: HydratedDocument<IBook>[] | null = [];
  try {
    for await (const book of Book.find({ users: userID })) {
      books.push(book.toObject({ getters: true }));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }
  res.json({
    books,
  });
};

export const getBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let book: HydratedDocument<IBook> | null;
  try {
    book = await Book.findById(req.params.bid);
    if (!book) {
      return next(new HttpError("Cannot find book for the id", 404));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }

  res.json({
    book: book.toObject({ getters: true }),
  });
};
export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!validationResult(req).isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  const {
    author,
    title,
    description,
    cover,
    pages,
    release_date,
    isbn,
    userID,
  } = req.body;

  const book = new Book({
    author,
    title,
    description,
    cover,
    pages,
    release_date,
    rating: {
      score: 0,
      reviews: [],
    },
    users: [userID],
    isbn,
  });
  let user: HydratedDocument<IUser> | null;
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      user = await User.findById(userID);
      if (!user) {
        return next(new HttpError("Could not find user", 500));
      }
      await book.save({ session });
      user.books.push({
        id: book._id,
        status: "new",
        isFavourite: false,
      });
      await user?.save({ session });
      await session.commitTransaction();

      session.endSession();
    });
  } catch (err) {
    return next(new HttpError("Could not create a new book.", 500));
  }
  res.status(201).json({
    book,
  });
};
export const createBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!validationResult(req).isEmpty()) {
    return next(new HttpError("Invalid Inputs", 422));
  }
  const { books } = req.body;
  try {
    await Book.insertMany(books);
  } catch (err) {
    return next(new HttpError("Could not create a new book.", 500));
  }
  res.status(201).json({
    books,
  });
};
export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!validationResult(req).isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  let updatedBook: HydratedDocument<IBook> | null;
  const { author, title, description, cover, pages, release_date, isbn } =
    req.body;
  try {
    updatedBook = await Book.findByIdAndUpdate(req.params.bid, {
      author,
      title,
      description,
      cover,
      pages,
      release_date: release_date && new Date(release_date),
      isbn,
    });
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }
  res.status(200).json({
    updatedBook,
  });
};
export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await Book.findById(req.params.bid);
    if (!book) {
      return next(new HttpError("Couldn`t find book for this id.", 404));
    }
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const doc = await book.populate<{ users: HydratedDocument<IUser>[] }>(
        "users"
      );

      for await (const user of doc.users) {
        user.books.pull({ id: book });
        await user.save({ session });
      }
      await book.deleteOne({ session });

      await session.commitTransaction();

      session.endSession();
    });
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }
  res.status(200).json({
    message: `Book with id=${req.params.bid} was deleted.`,
  });
};
export const addRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let book: HydratedDocument<IBook> | null;
  let user: HydratedDocument<IUser> | null;
  const { uid, score } = req.body;
  try {
    book = await Book.findById(req.params.bid);
    user = await User.findById(uid);
  } catch (err) {
    return next(new HttpError(`Something went wrong`, 500));
  }
  if (!book || !user) {
    const message = !book ? "Book" : "User";
    return next(new HttpError(`${message} not found`, 404));
  }
  const reviews = book.rating.reviews;
  const raviewExist = reviews.find((el) => el.id == uid);

  if (raviewExist) {
    raviewExist.score = score;
  } else {
    reviews.push({
      id: user._id,
      score,
    });
  }
  const totalScore: number = reviews.reduce((acc, el) => {
    return acc + el.score;
  }, 0);
  book.rating.score = totalScore / reviews.length;
  try {
    await book.save();
  } catch (err) {
    return next(new HttpError(`Something went wrong`, 500));
  }
  res.json({
    book,
  });
};
