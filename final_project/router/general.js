const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if (!username) {
    return res.status(400).json({message: 'Username must be provided in request body.'})
  }
  if (!password) {
    return res.status(400).json({message: 'Password must be provided in request body.'})
  }
  // check existing users
  const isValidated = isValid(username)
  if (isValidated) {
    return res.status(409).json({message: `You have already registered.`})
  } 
  else {
    users.push({
        username: username,
        password: password
    })
    return res.status(200).json({message: "You are registered!"})
  }
});

// Define a separate API endpoint just for raw data
public_users.get('/api/books', (req, res) => {
  res.json(books);
});

const BOOKS_URL = 'https://kathuang617-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/api/books';

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try{
    const response = await axios.get(BOOKS_URL)
    return res.status(200).send(JSON.stringify(response.data))
  } catch(error){
    console.error('Error fethcing books:', error.message)
    return res.status(500).json({message: 'Error fetching books', error: error.message})
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  try{
    const response = await axios.get(BOOKS_URL)
    const books = response.data;
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
      return res.status(404).send({message: `ISBN: ${isbn} does not exist`})
    }
    return res.status(200).send(JSON.stringify(book))
  } catch (error) {
    console.error('Error fetching books', error.message)
    return res.status(400).send({message: 'Books not found'})
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try{
    const response = await axios.get(BOOKS_URL)
    console.log(response)
    const books = response.data;
    const author = req.params.author;
    const matched = Object.values(books).filter(book=>book.author===author)
    if (matched && matched.length){
      return res.status(200).send(JSON.stringify(matched))
    } else {
      return res.status(400).send({message:`No matched books for author ${author}`})
    }

  } catch(error){
    console.error('Error fetching books', error.message)
    return res.status(400).send({message: 'Books not found'})
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try{
    const response = await axios.get(BOOKS_URL);
    const books = response.data;
    const title = req.params.title;
    const matched = Object.values(books).filter(book=>book.title===title);
    if (!matched.length) {
      return res.status(400).send({message: `No matched books for title ${title}`})
  }
  return res.status(200).send(JSON.stringify(matched))
  } catch(error){
    console.error('Error fetching books', error.message)
    return res.status(400).send({message: 'Books not found'})
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book){
    return res.status(400).json({message: `No book found for ISBN: ${isbn}`})
  } else {
    return res.status(200).send(JSON.stringify(books.review))
  }
});

module.exports.general = public_users;
