import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import HttpError from "../models/http-error";

import Book, { IBook } from "../models/book";
import { HydratedDocument } from "mongoose";

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
  const { author, title, description, cover, pages, release_date } = req.body;
  const book = new Book({
    author,
    title,
    description,
    cover,
    pages,
    release_date,
  });
  try {
    await book.save();
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
  const { author, title, description, cover, pages, release_date } = req.body;
  try {
    updatedBook = await Book.findByIdAndUpdate(req.params.bid, {
      author,
      title,
      description,
      cover,
      pages,
      release_date: new Date(release_date),
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
    await Book.findByIdAndDelete(req.params.bid);
  } catch (err) {
    return next(new HttpError("Something wentwrong", 500));
  }
  res.status(200).json({
    message: `Book with id=${req.params.bid} was deleted.`,
  });
};
