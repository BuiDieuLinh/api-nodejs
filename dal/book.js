
module.exports = function(pgPool) {
    if (!pgPool || !pgPool.pool) {
        throw Error('Missing DB connection!');
    }
    const pool = pgPool.pool;

   // Hàm lấy tất cả sách
   function getAllBook(callback) {
        const sql = 'SELECT * FROM public.books'; 
        pool.query(sql, (error, books) => {
            if (error) {
                return callback(error, null);
            }
            console.log('books: ', books.rows);
            return callback(null, books.rows);
        });
    }

    // lấy books theo id
    function getByid(id, callback){
        const sql = `SELECT * FROM public.books WHERE book_id = $1`;
        pool.query(sql, [id], (err, res) => {
            if (err) {
                return callback(err);
            }
            callback(null, res.rows[0]); // trả về 1 books (hoặc null nếu không tìm thấy)
        });
    }    

    // hàm thêm sách
    function addBook(book, callBack) {
        const { book_id, title, author, genre, published_year} = book;
        const insertQuery = `
            INSERT INTO public.books (book_id, title, author, genre, published_year)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING book_id
        `;
        const values = [book_id, title, author, genre, published_year];
    
        pool.query(insertQuery, values, (err, res) => {
            if (err) {
                console.error('Error inserting books:', err); // Ghi lại lỗi chi tiết
                return callBack({ message: "Lỗi khi chèn dữ liệu", error: err.message || err });
            }
            const insertedId = res.rows[0].book_id;
            callBack(null, { book_id: insertedId, ...book });
        });
    }

    // cập nhập books
    function updateBook(id, book, callback) {
        const { book_id, title, author, genre, published_year } = book;
        const sql = `
            UPDATE public.books 
            SET title = $1, author = $2, genre = $3, published_year = $4 
            WHERE book_id = $5
            RETURNING *;
        `;
        const values = [book_id, title, author, genre, published_year, id];
    
        pool.query(sql, values, (err, res) => {
            if (err) {
                return callback(err);
            }
            callback(null, res.rows[0]); // trả về books đã cập nhật
        });
    }
    

    // xoá books
    function deleteBook(id, callback) {
        const sql = `DELETE FROM public.books WHERE book_id = $1 RETURNING *`;
        pool.query(sql, [id], (err, res) => {
            if (err) {
                return callback(err);
            }
            if (res.rowCount === 0) {
                return callback(null, null); // không tìm thấy books
            }
            callback(null, res.rows[0]); // trả về books đã xoá
        });
    }
    
    function searchBooks(options = {}, limit = 5, offset = 0, callback) {
        console.log('options: ', options);
        const { title, genre } = options;
        if (!title && !genre) {
            console.log('Không có tiêu chí tìm kiếm, trả về rỗng');
            return callback(null, []);
        }
    
        const parsedLimit = parseInt(limit, 10) || 5; // Đảm bảo limit là số
        const parsedOffset = parseInt(offset, 10) || 0; // Đảm bảo offset là số
        let sql = `
            select 	b.book_id,
                    b.title,
                    b.author,
                    b.genre,
                    b.created_date
            from	books b
            where 	1 = 1
        `;

        const params = [];
        if (title) {
            sql += ` and b."title" ilike $${params.length + 1}`;
            params.push(`%${title}%`);
        }
        if (genre) {
            sql += ` and b.genre = $${params.length + 1}`;
            params.push(genre);
        }
        sql += `
            limit ${limit}
            offset ${offset}
        `;
        console.log('sql: ', parsedLimit);
        console.log('params: ', parsedOffset);

        pool.query(sql, params, function(error, books) {
            if (error) {
                throw error;
            }

            console.log('books: ', books.rows);

            return callback(null, books.rows);
        });
    }
    return {getAllBook, getByid, addBook, updateBook, deleteBook, searchBooks}
}