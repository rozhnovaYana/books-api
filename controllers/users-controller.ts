import mongoose, { HydratedDocument } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import HttpError from "../models/http-error";

import User, { IUser } from "../models/user";
import Book, { IBook } from "../models/book";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let users: HydratedDocument<IUser>[] | null = [];
  try {
    for await (const book of User.find({}, "-password")) {
      users.push(book.toObject({ getters: true }));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }
  res.json({
    users,
  });
};
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let user: HydratedDocument<IBook> | null;
  try {
    user = await User.findById(req.params.uid);
    if (!user) {
      return next(new HttpError("Cannot find user for the id", 404));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }

  res.json({
    user: user.toObject({ getters: true }),
  });
};
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!validationResult(req).isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  const { login, name, password } = req.body;
  let user: HydratedDocument<IUser>;
  try {
    const existingUser = await User.findOne({ login });
    if (existingUser) {
      return next(new HttpError("The user already exists", 401));
    }
    user = new User({ login, name, password, books: [] });
    user.save();
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }
  res.status(201).json({ user: user.toObject({ getters: true }) });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!validationResult(req).isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  const { login, password } = req.body;
  let user: HydratedDocument<IUser> | null;
  try {
    user = await User.findOne({ login });
    if (!user) {
      return next(new HttpError("User not found", 401));
    }
    if (user?.password !== password) {
      return next(new HttpError("Password is not correct", 401));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }

  res.status(200).json({
    user,
  });
};

export const addBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { bookId } = req.body;
  let book: HydratedDocument<IBook> | null;
  let user: HydratedDocument<IUser> | null;
  try {
    book = await Book.findById(bookId);
    user = await User.findById(req.params.uid);
    if (!book || !user) {
      const message = !book ? "Book" : "User";
      return next(new HttpError(`${message} is not found.`, 404));
    }
    if (user.books.find((el) => el.id.toString() === bookId)) {
      return next(new HttpError(`The book already exists.`, 404));
    }
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      user?._id && book?.users.push(user._id);
      await book?.save({ session });
      book?._id &&
        user?.books.push({ id: book._id, status: "new", isFavourite: false });
      await user?.save({ session });
      await session.commitTransaction();

      session.endSession();
    });
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }
  res.status(200).json({
    user,
  });
};
export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let book: HydratedDocument<IBook> | null;
  let user: HydratedDocument<IUser> | null;
  const { status, isFavourite, bookId } = req.body;
  try {
    book = await Book.findById(bookId);
    user = await User.findById(req.params.uid);
    let bookExisting =
      user && user.books.find((el) => el.id?.toString() === bookId);

    if (!book || !user || !bookExisting) {
      const message = !book || !bookExisting ? "Book" : "User";
      return next(new HttpError(`${message} is not found.`, 404));
    }
    user = await User.findOneAndUpdate(
      {
        "books.id": bookId,
      },
      {
        $set: {
          "books.$.status": status,
          "books.$.isFavourite": isFavourite,
        },
      },
      {
        new: true,
      }
    );
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }
  res.status(200).json({ user });
};

