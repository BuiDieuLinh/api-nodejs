
module.exports = function(pgPool) {
    if (!pgPool || !pgPool.pool) {
        throw Error('Missing DB connection!');
    }
    const pool = pgPool.pool;

   // Hàm lấy tất cả người dùng
   function getAllUser(callback) {
        const sql = 'SELECT * FROM public.users'; 
        pool.query(sql, (error, users) => {
            if (error) {
                return callback(error, null);
            }
            console.log('user: ', users.rows);
            return callback(null, users.rows);
        });
    }

    // lấy user theo id
    function getByid(id, callback){
        const sql = `SELECT * FROM public.users WHERE user_id = $1`;
        pool.query(sql, [id], (err, res) => {
            if (err) {
                return callback(err);
            }
            callback(null, res.rows[0]); // trả về 1 user (hoặc null nếu không tìm thấy)
        });
    }    

    // hàm thêm người dùng
    function addUser(user, callBack) {
        const { user_id, username, email, password, role, name } = user;
        const insertQuery = `
            INSERT INTO public.users (user_id,username, email, password, role, name)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id
        `;
        const values = [user_id,username, email, password, role, name];
    
        pool.query(insertQuery, values, (err, res) => {
            if (err) {
                console.error('Error inserting user:', err); // Ghi lại lỗi chi tiết
                return callBack({ message: "Lỗi khi chèn dữ liệu", error: err.message || err });
            }
            const insertedId = res.rows[0].user_id;
            callBack(null, { user_id: insertedId, ...user });
        });
    }

    // cập nhập user
    function updateUser(id, user, callback) {
        const { username, email, password, role, name } = user;
        const sql = `
            UPDATE public.users 
            SET username = $1, email = $2, password = $3, role = $4, name = $5
            WHERE user_id = $6
            RETURNING *;
        `;
        const values = [username, email, password, role, name, id];
    
        pool.query(sql, values, (err, res) => {
            if (err) {
                return callback(err);
            }
            callback(null, res.rows[0]); // trả về user đã cập nhật
        });
    }
    

    // xoá user
    function deleteUser(id, callback) {
        const sql = `DELETE FROM public.users WHERE user_id = $1 RETURNING *`;
        pool.query(sql, [id], (err, res) => {
            if (err) {
                return callback(err);
            }
            if (res.rowCount === 0) {
                return callback(null, null); // không tìm thấy user
            }
            callback(null, res.rows[0]); // trả về user đã xoá
        });
    }
    
    // login
    function login(username, callback) {
        const sql = `SELECT * FROM public.users WHERE username = $1`;
        pool.query(sql, [username], (err, res) => {
            if (err) return callback(err);
            if (res.rows.length === 0) return callback(null, null); // không tìm thấy
            callback(null, res.rows[0]);
        });
    }
    
    return {getAllUser, addUser, getByid, updateUser, deleteUser, login}
}