const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    //write code to check is the username is valid
    const user = users.find(user => user.username === username);
    return !!user; // Return true if user is found (truthy), false otherwise
}
    
const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    if (isValid(username)){
        const user = users.find(user=>user.username===username)
        return user.password===password
    }
    return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    if (!username) return res.status(404).json({message: 'User name is required.'})
    if (!password) return res.status(404).json({message: 'Password is missing.'})
    
    // Authenticate the user
    if (authenticatedUser(username, password)){
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', {expiresIn: 60*1200})
        // Store access token and user name in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in.")
    }

    return res.status(208).json({message: "Invalid Login."});
});

// Add a book review
regd_users.put("/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({message: `Book not found for ISBN: ${isbn}`})
  const username = req.session.authorization.username;
  const review = req.body.review;
  book.reviews[username] = review
  
  console.log(book)

  return res.status(200).send({book})
});

// Delete a book review
regd_users.delete("/review/:isbn", (req, res)=>{
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({message: `Book not found for ISBN: ${isbn}`})
  const username = req.session.authorization.username;
  delete books[username];
  return res.status(200).json({message:`Review by ${username} has been deleted.`})
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
