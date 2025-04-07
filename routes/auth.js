const express = require('express');
const route = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pgPool = require('../initDB');
const dalUser = require('../dal/user')(pgPool)

const JWT_SECRET = process.env.JWT_SECRET;

//login
route.post('/login', (req, res) =>{
    const {username, password} = req.body;
    dalUser.login(username, (err, foundUser) => {
        if (err) {
            console.error("Lỗi truy vấn database:", err);
            return res.status(500).send('Lỗi server');
        }

        if (!foundUser) {
            console.warn("Không tìm thấy user:", username);
            return res.status(400).send('Tên người dùng hoặc mật khẩu không đúng');
        }

        console.log("Tìm thấy user:", foundUser);

        // so sánh input pw vs pass đc mã hoá
        const isVaildPass = bcrypt.compareSync(password, foundUser.password);
        if (!isVaildPass) {
            console.warn("Mật khẩu không đúng:", password);
            return res.status(400).send('Tên người dùng hoặc mật khẩu không đúng');
        }

        // Tạo JWT Token
        const token = jwt.sign({ user_id: foundUser.user_id, username: foundUser.username, role: foundUser.role }, JWT_SECRET, { expiresIn: '1h' });

        console.log("Đăng nhập thành công, trả về token");
        res.status(200).json({ token });
    });
})
module.exports = route;