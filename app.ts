import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";

import booksRoutes from "./routes/books-routes";
import userRoutes from "./routes/user-routes";

import HttpError from "./models/http-error";
import mongoose from "mongoose";

const app = express();

app.use(bodyParser.json());

app.use("/api/books", booksRoutes);
app.use("/api/users", userRoutes);

// error handlers
app.use((req: Request, res: Response, next: NextFunction) =>
  next(new HttpError("Cannot find the page", 404))
);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.codeStatus || 500)
    .json({ message: error.message || "Unknown error was occured." });
});
// error handlers
mongoose
  .connect(
    "mongodb+srv://yanatska:LqfD4fqPhZPJGW4s@cluster0.uwshtxc.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
