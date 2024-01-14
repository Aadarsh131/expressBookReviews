const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const loadBooks = require("./auth_users.js").loadBooks;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(!username || !password){
    return res.status(401).json({message: "Error Registering"})
  }
  if (!isValid(username)) {
    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered" });
  }
  return res
    .status(401)
    .json({ message: "username already exists, login instead" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  loadBooks(books)
    .then((response) => res.send(response))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  loadBooks(books[isbn])
    .then((response) => res.send(response))
    .catch(() =>
      res.status(404).json({ message: `No Book found with isbn: ${isbn}` })
    );
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  let bookList = [];
  loadBooks(books)
    .then((response) => {
      Object.values(response).map((book) => {
        if (book["author"] == author) bookList.push(book);
      });
      if (bookList.length > 0) {
        return res.send(bookList);
      }
      return res
        .status(404)
        .json({ message: `No Book/s found with author: ${author}` });
    })
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  //assuming the two authors might have same title
  let bookList = [];
  loadBooks(books)
    .then((response) => {
      Object.values(response).map((book) => {
        if (book["title"] == title) bookList.push(book);
      });

      if (bookList.length > 0) {
        return res.send(bookList);
      }
      return res
        .status(404)
        .json({ message: `No Book/s found with title: ${title}` });
    })
    .catch((err) => res.status(404).json({ message: err.message }));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  loadBooks(books[isbn])
    .then((response) => res.send(response["reviews"]))
    .catch(() =>
      res.status(404).json({ message: `No Book found with isbn: ${isbn}` })
    );
});

module.exports.general = public_users;
