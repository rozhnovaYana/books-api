import express from "express";
import { body } from "express-validator";

import {
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  createBooks,
  getBooks,
} from "../controllers/books-controller";

const router = express.Router();

const stringNotEmpty = (field: string, optional: boolean = false) => {
  if (!optional) {
    return body(field).trim().notEmpty();
  } else {
    return body(field).trim().optional().notEmpty();
  }
};

router.get("/:bid", getBookById);
router.get("/", getBooks);
// router.get("/user/:uid", getBooksByUserId);

router.patch(
  "/:bid",
  ["author", "title", "description", "cover", "release_date"].map((i: string) =>
    stringNotEmpty(i, true)
  ),
  body("pages").trim().notEmpty().isNumeric(),
  updateBook
);

router.delete("/:bid", deleteBook);

router.post(
  "/",
  ["author", "title", "description", "cover", "release_date"].map((i: string) =>
    stringNotEmpty(i)
  ),
  body("pages").trim().notEmpty().isNumeric(),
  createBook
);

router.post(
  "/batch",
  [
    "books.*.author",
    "books.*.title",
    "books.*.description",
    "books.*.cover",
    "books.*.release_date",
  ].map((i: string) => stringNotEmpty(i)),
  body("books.*.pages").trim().notEmpty().isNumeric(),
  createBooks
);

export default router;
