import { NextFunction, Request, Response } from "express";
import { v4 } from "uuid";
import { validationResult } from "express-validator";

import { users } from "../data";
import HttpError from "../models/http-error";
import { User } from "../types/User";

export const getAllUsers = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    users,
  });
};

export const signUp = (req: Request, res: Response, next: NextFunction) => {
  if (!validationResult(req).isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  const { login, name, password } = req.body;
  const existingUser = users.find((el: User) => el.login == login);
  if (existingUser) {
    return next(new HttpError("The user already exists", 401));
  }
  const user = { login, name, password, id: v4() };
  users.push(user);
  res.status(201).json({ user });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  if (!validationResult(req).isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  const { login, password } = req.body;
  const user = users.find((el: User) => el.login == login);
  if (!user) {
    return next(new HttpError("User not found", 401));
  }
  if (user.password !== password) {
    return next(new HttpError("Password is not correctd", 401));
  }
  res.status(200).json({
    user,
  });
};
