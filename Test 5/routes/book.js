const express = require('express');
const router = express.Router();
const { Book } = require('../app');

// List all books
router.get('/books', async (req, res) => {
    const books = await Book.findAll();
    res.render('books', { books });
});

// Display form for creating a new book
router.get('/books/new', (req, res) => {
    res.render('newBook');
});

// Handle submission of form and create a new book
router.post('/books', async (req, res) => {
    await Book.create(req.body);
    res.redirect('/books');
});

// Delete a book
router.post('/books/delete/:id', async (req, res) => {
    await Book.destroy({ where: { id: req.params.id } });
    res.redirect('/books');
});

module.exports = router;
