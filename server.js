const express = require('express');
const bodyparser = require('body-parser');
require('dotenv').config();
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/book');
const middlewares = require('./middleware');

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', userRoutes);
app.use('/auth', authRoutes);
app.use('/api', bookRoutes)
// app.use('/api/books', middlewares.authenticateToken, bookRoutes);



app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
