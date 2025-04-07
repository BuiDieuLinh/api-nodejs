const pg = require('pg');

const pool = new pg.Pool({
    host: 'localhost',
    port: process.env.PORT,
    database: process.env.DATABASE,
    user: process.env.USERNAME,
    password: process.env.PASSWORD
});

module.exports = { pool }