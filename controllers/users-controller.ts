import { NextFunction, Request, Response } from "express";
import { v4 } from "uuid";
import { validationResult } from "express-validator";

import HttpError from "../models/http-error";
import User, { IUser } from "../models/user";
import { HydratedDocument } from "mongoose";

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
    user = new User({ login, name, password });
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
      return next(new HttpError("Password is not correctd", 401));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }

  res.status(200).json({
    user,
  });
};
