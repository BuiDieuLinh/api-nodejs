const ex = require('express');
const route = ex.Router();
const { body, validationResult } = require('express-validator');
const middleware = require('../middleware')
const pgPool = require('../initDB');
const dalBook = require('../dal/book')(pgPool);


// getall data
route.get('/books',  (req, res) =>{
    dalBook.getAllBook((error, books) => {
        if (error) {
            console.error('Error fetching books:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!books || books.length === 0) {
            return res.status(404).json({ message: 'No books found' });
        }

        res.status(200).json(books);
    });
})

// getbyid book
route.get('/books/:id', (req, res) =>{
    const id = req.params.id;
    dalBook.getByid(id, (err, result) =>{
        if (err) {
            return res.status(400).json(err);
        }
        if (!result) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }
        res.status(200).send(result);
    })
})

// add book
route.post('/books', [
    body('title').notEmpty().withMessage('tên sách không được để trống'),
    body('author').notEmpty().withMessage('tác giả không được để trống'), 
    body('genre').notEmpty().withMessage('thể loại không được để trống'), 
    body('published_year').notEmpty().withMessage('ngày phát hành không được để trống')
], (req,res) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const user = req.body;
    
    dalBook.addBook(user, (err, result) => {
        if (err) {
            return res.status(400).json(err);
        }
        res.send(result);
    });    
})

// update book
route.put('/books/:id', [
    body('title').notEmpty().withMessage('tên sách không được để trống'),
    body('author').notEmpty().withMessage('tác giả không được để trống'), 
    body('genre').notEmpty().withMessage('thể loại không được để trống'), 
    body('published_year').notEmpty().withMessage('ngày phát hành không được để trống')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id;
    const updatedBook = req.body;
    dalBook.updateUser(id,updatedBook, (err, result) =>{
        if (err) {
            return res.status(400).json({ message: 'Cập nhật thất bại', error: err.message });
        }
        res.json({ message: 'Cập nhật thành công', user: result });
    } )
});

// delete book
route.delete('/books/:id', middleware.requireToken, middleware.verifyAdmin, (req, res) => {
    const id = req.params.id;

    dalBook.deleteBook(id, (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Xoá thất bại', error: err.message });
        }
        if (!result) {
            return res.status(404).json({ message: 'Không tìm thấy sách để xoá' });
        }
        res.json({ message: 'Xoá sách thành công', user: result });
    });
});

// search book
route.get('/search', (req, res) =>{
    dalBook.searchBooks(req.body, req.query.limit, req.query.offset, function (error, books) {
        if (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }

        res.json(books);
        return;
    });
})
module.exports = route;