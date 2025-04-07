const express = require('express');
const route = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const middleware = require('../middleware')
const pgPool = require('../initDB');
const dalUser = require('../dal/user')(pgPool);


// getall data
route.get('/users',  (req, res) =>{
    dalUser.getAllUser((error, users) => {
        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json(users);
    });
})

// getbyid user
route.get('/users/:id', (req, res) =>{
    const id = req.params.id;
    dalUser.getByid(id, (err, result) =>{
        if (err) {
            return res.status(400).json(err);
        }
        if (!result) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        res.status(200).send(result);
    })
})

// add user
route.post('/users', [
    body('user_id').notEmpty().withMessage('ID không được để trống'),
    body('username').notEmpty().withMessage('Username không được để trống'), 
    body('name').notEmpty().withMessage('name không được để trống'), 
    body('email').isEmail().withMessage('Email không hợp lệ'), 
    body('password').isLength({min: 6}).withMessage('Mật khẩu phải có ít nhật 6 ký tự')
], (req,res) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const user = req.body;
    user.role = req.body.role || "user";

    // hash password
    const hashedPassword = bcrypt.hashSync(user.password, 12)
    if(!hashedPassword){
        return res.json({message: "Create password error"})
    }
    user.password = hashedPassword;
    dalUser.addUser(user, (err, result) => {
        if (err) {
            return res.status(400).json(err);
        }
        res.send(result);
    });    
})

// update user
route.put('/users/:id', [
    body('username').notEmpty().withMessage('Tên người dùng không được để trống'),
    body('name').notEmpty().withMessage('Tên không được để trống'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu ít nhất 6 ký tự')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id;
    const updatedUser = req.body;

    const hashedPassword = bcrypt.hashSync(updatedUser.password, 12)
    if(!hashedPassword){
        return res.json({message: "Create password error"})
    }
    updatedUser.password = hashedPassword;
    dalUser.updateUser(id,updatedUser, (err, result) =>{
        if (err) {
            return res.status(400).json({ message: 'Cập nhật thất bại', error: err.message });
        }
        res.json({ message: 'Cập nhật thành công', user: result });
    } )
});

// delete user
route.delete('/users/:id', middleware.requireToken, middleware.verifyAdmin, (req, res) => {
    const id = req.params.id;

    dalUser.deleteUser(id, (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Xoá thất bại', error: err.message });
        }
        if (!result) {
            return res.status(404).json({ message: 'Không tìm thấy user để xoá' });
        }
        res.json({ message: 'Xoá người dùng thành công', user: result });
    });
});

module.exports = route;