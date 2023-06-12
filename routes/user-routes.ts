import express from "express";
import { body } from "express-validator";

import { getAllUsers, signUp, login } from "../controllers/users-controller";

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

export default router;
