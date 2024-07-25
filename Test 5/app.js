const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Sequelize
const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'OJQ8eVKI5Liu', {
  host: 'ep-wispy-sound-a580g0nv.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Define the Book model
const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Sync the database
sequelize.sync();

// Routes
app.get('/books', async (req, res) => {
  const books = await Book.findAll();
  res.render('books', { books });
});

app.get('/books/new', (req, res) => {
  res.render('newBook');
});

app.post('/books', async (req, res) => {
  await Book.create(req.body);
  res.redirect('/books');
});

app.post('/books/delete/:id', async (req, res) => {
  await Book.destroy({ where: { id: req.params.id } });
  res.redirect('/books');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = { app, Book };

  