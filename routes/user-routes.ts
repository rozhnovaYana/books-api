import express from "express";
import { body } from "express-validator";

import {
  getAllUsers,
  signUp,
  login,
  addBook,
  updateBook,
  getUserById,
} from "../controllers/users-controller";

const createValidationChain = () => [
  body("login").trim().normalizeEmail().notEmpty().isEmail(),
  body("password").notEmpty(),
];

const router = express.Router();

router.get("/:uid", getUserById);
router.get("/", getAllUsers);

router.post(
  "/signup",
  body("name").notEmpty(),
  createValidationChain(),
  signUp
);

router.post("/login", createValidationChain(), login);

router.post("/:uid/book", body("bookId").trim().notEmpty(), addBook);
router.patch("/:uid/book", body("bookId").trim().notEmpty(), updateBook);

export default router;
