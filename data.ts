import { IBook } from "./models/book";
import type { User } from "./types/User";

let books: IBook[] = [
  {
    author: "J. K. Rowling",
    id: "p1",
    title: "Harry Potter and the Philosopher's Stone",
    description:
      "Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. Addressed in green ink on yellowish parchment with a purple seal, they are swiftly confiscated by his grisly aunt and uncle. Then, on Harry's eleventh birthday, a great beetle-eyed giant of a man called Rubeus Hagrid bursts in with some astonishing news: Harry Potter is a wizard, and he has a place at Hogwarts School of Witchcraft and Wizardry. An incredible adventure is about to begin!",
    cover:
      "https://www.wizardingworld.com/images/products/books/UK/rectangle-1.jpg",
    pages: 223,
    release_date: "1997-06-26",
  },
];
export let users: User[] = [
  {
    id: "u1",
    name: "Yana Anatska",
    login: "yanatska@test.com",
    password: "qwerty12",
  },
  {
    id: "u2",
    name: "Denys Anatskii",
    login: "dena@test.com",
    password: "qwerty212",
  },
];
module.exports = {
  books,
  users,
};
