const express = require('express');
const bodyparser = require('body-parser');
require('dotenv').config();
const router = require('./route.js');
const middleware = require('./middleware.js');

const app = express();

const PORT = 3000;

// app.get('/', (req, res) => {
//     res.send('Develop API back-end for applications with NodeJS Express!');
// });

app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', router)

app.use(middleware.requireToken, middleware.verifyAdmin);
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
