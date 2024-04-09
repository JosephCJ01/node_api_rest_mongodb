const express = require('express');
const router = express.Router();
const Book = require('../models/book.model');
const mongoose = require('mongoose');

// MIDDLEWARE
const getBook = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({
            message: 'El ID del libro no es válido'
        });
    }

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                message: 'El libro no fue encontrado'
            });
        }
        res.book = book;
        next();
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// obtener todos los libros [GET ALL]
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        console.log('GET ALL', books);
        if (books.length === 0) {
            return res.status(204).json([]);
        }
        res.json(books);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// crear un nuevo libro (recurso) [POST]
router.post('/', async (req, res) => {
    const { title, author, genre, publication_date } = req.body;
    if (!title || !author || !genre || !publication_date) {
        return res.status(400).json({
            message: 'Los campos del título, autor, género y fecha son obligatorios'
        });
    }
    const book = new Book({
        title,
        author,
        genre,
        publication_date
    });

    try {
        const newBook = await book.save();
        console.log(newBook);
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

router.get('/:id',getBook, async(req,res) =>{
    res.json(res.book);
})

router.put('/:id',getBook, async(req,res) =>{
    try {
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;

        const updatedBook = await book.save()
        res.json(updatedBook)
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
})

router.patch('/:id',getBook, async(req,res) =>{

    if(!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date ){
        res.status(400).json({
            message: 'al menos uno de estos campos debe ser enviado: Fitulo, Autor, Género y Fecha de publicacion '
        });
    }

    try {
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;

        const updatedBook = await book.save()
        res.json(updatedBook)
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
})

// eliminar un libro por su ID [DELETE]
router.delete('/:id', getBook, async (req, res) => {
    try {
        const book = res.book
        await res.book.deleteOne({
            _id: book._id
        });
        res.json({ message: `El libro '${book.title}' ha sido eliminado correctamente` });
    } catch (error) {
        res.status(500).json({
             message: error.message 
        });
    }
});


module.exports = router;
