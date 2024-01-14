const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

function loadBooks(books) {
  return new Promise((resolve, reject) => {
    //checking for books availability
    if (Object.keys(books).length > 0) {
      resolve(books);
    } else reject({ message: "No books available" });
  });
}

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.map((user) => {
    if (user.username === username && user.password === password) return true;
  });
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "Login successful!!" });
  }
  return res
    .status(208)
    .json({ message: "Login failed, invalid username or password" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization["username"];
  const review = req.body.review;

  loadBooks(books[isbn])
    .then((response) => {
      //if the user forgets to enter the review
      if (!review) {
        return res.status(403).json({ message: "please add a review" });
      }
      response["reviews"][username] = review;
      return res.send(response);
    })
    .catch(() =>
      res.status(404).json({ message: `No Book found with isbn: ${isbn}` })
    );
});

//Deleting book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization["username"];
  loadBooks(books[isbn])
    .then((response) => {
      //checking if the review for username even exists
      if (response["reviews"][username]) {
        delete response["reviews"][username];
        return res.send({
          message: `Review deleted for username:${username}, on the book with isbn:${isbn}`,
        });
      } else {
        return res
          .status(200)
          .json({ message: "Review cann't be deleted as it doesn't exist" });
      }
    })
    .catch(() =>
      res.status(404).json({
        message: `No reviews present, as the book with isbn: ${isbn} is not available`,
      })
    );
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.loadBooks = loadBooks;
