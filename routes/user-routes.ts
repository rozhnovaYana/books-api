import express from "express";
import { body } from "express-validator";

import {
  getAllUsers,
  signUp,
  login,
  addBook,
} from "../controllers/users-controller";

const createValidationChain = () => [
  body("login").trim().normalizeEmail().notEmpty().isEmail(),
  body("password").notEmpty(),
];

const router = express.Router();

router.get("/", getAllUsers);

router.post(
  "/signup",
  body("name").notEmpty(),
  createValidationChain(),
  signUp
);

router.post("/login", createValidationChain(), login);

router.post("/:uid/book", body("bookId").trim().notEmpty(), addBook);

export default router;
