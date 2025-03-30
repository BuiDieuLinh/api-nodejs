const express = require('express');
const route = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const middleware = require('./middleware')

const JWT_SECRET = process.env.JWT_SECRET;
let users = [
    {user_id: '1',username: 'admin', password: '$2a$12$O/aOTWj8CWmahy.9Axeza.Viq/OUB1Uy.9eOA0I4MpCvgFTMdWTHy', name: 'Linh', email: 'abc@gmail.com', role: 'admin'},
    {user_id: '2',username: 'dev1', password: '$2a$12$z1it4r0Xmsq4zmN7XVGs/e/Ht3yoYKUsUFFHk2KTqFgiOD4z3T1yK', name: 'Quynh', email: 'abc@gmail.com', role: 'user'},
]

// update path: update full info of user: PUT /users/:id <> update a part of user info: PATCH /users/:id

// getall data
route.get('/users',  (req, res) =>{
    return res.status(200).json(users);
})

// getbyid user
route.get('/users/:id', (req, res) =>{
    const id = req.params.id;
    const user = users.find(u => u.user_id === id)
    if(!user){
        return res.status(404).json({message: 'User này không tồn tại'})
    }
    return res.status(200).json(user)
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

    // kiểm tra id, username, email đã tồn tại chưa?
    const isID = users.find(u => u.user_id === user.user_id);
    const isUserName = users.find(u => u.username === user.username);
    const isEmail = users.find(u => u.email === user.email);

    if(isID){
        return res.status(400).json({message: "ID đã tồn tại"})
    }
    if(isUserName){
        return res.status(400).json({message: "Username đã tồn tại"})
    }
    if(isEmail){
        return res.status(400).json({message: "Email đã tồn tại"})
    }
    
    // hash password
    const hashedPassword = bcrypt.hashSync(user.password, 12)
    if(!hashedPassword){
        return res.json({message: "Create password error"})
    }
    user.password = hashedPassword;
    users.push(user)
    return res.status(200).json({ message: "Thêm user thành công!", user})
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
    const { username, name, email, password, role} = req.body;

    const hashedPassword = bcrypt.hashSync(password, 12)
    if(!hashedPassword){
        return res.json({message: "Create password error"})
    }
    password = hashedPassword;
    const userIndex = users.findIndex(user => user.user_id === id);
    if (userIndex === -1) {
        return res.status(404).json({ message: "User không tồn tại!" });
    }

    users[userIndex] = { id, username, name, email, password, role};
    return res.json({ message: "Cập nhật thành công!", user: users[userIndex] });
});

// delete user
route.delete('/users/:id', middleware.requireToken, middleware.verifyAdmin, (req, res) => {
    const id = req.params.id;

    const userIndex = users.findIndex(user => user.user_id === id);
    if (userIndex === -1) {
        return res.status(404).json({ message: "User không tồn tại!" });
    }

    users.splice(userIndex, 1);
    return res.json({ message: "Xóa user thành công!" });
});


//login
route.post('/login', (req, res) =>{
    const {username, password} = req.body;
    const loginUser = users.find( user => user.username === username)
    if(!loginUser){
        return res.status(400).json({message : 'username and password are invalid'})
    }
    const isVaild = bcrypt.compareSync(password, loginUser.password);
    if(!isVaild){
        return res.status(400).json({message : 'username and password are invalid'})
    }

    const token = jwt.sign(
        {username: loginUser.username, name: loginUser.name, role: loginUser.role}, JWT_SECRET, {expiresIn: '10h'}
    )
    return res.status(200).json(token);
})
module.exports = route;