create table public.users(
	user_id SERIAL PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	email VARCHAR(100) NOT NULL UNIQUE,
	password TEXT NOT NULL,
	role VARCHAR(20) DEFAULT 'user',
	name VARCHAR(100) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)


create table public.books(
	book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    published_year int NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.books (title, author, genre, published_year) VALUES
    ('Tắt Đèn', 'Ngô Tất Tố', 'Hiện thực', 1937),
    ('Lão Hạc', 'Nam Cao', 'Hiện thực', 1943),
    ('Đôi Mắt', 'Nam Cao', 'Truyện ngắn', 1948),
    ('Nỗi Buồn Chiến Tranh', 'Bảo Ninh', 'Chiến tranh', 1990),
    ('Cho Tôi Xin Một Vé Đi Tuổi Thơ', 'Nguyễn Nhật Ánh', 'Thiếu nhi', 2008),
    ('Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'Thiếu nhi', 1941),
    ('Truyện Kiều', 'Nguyễn Du', 'Thơ', 1820),
    ('Nhật Ký Trong Tù', 'Hồ Chí Minh', 'Thơ', 1943);

create table public.borrows(
	borrow_id SERIAL PRIMARY KEY,
	user_id INTEGER references public.users(user_id),
	book_id INTEGER references public.books(book_id),
	borrowed_date TIMESTAMP,
	return_date TIMESTAMP
)

INSERT INTO public.borrows (user_id, book_id, borrowed_date, return_date) VALUES
    (1, 1, '2025-03-01 10:00:00', '2025-03-15 14:30:00'),  -- Số Đỏ
    (2, 1, '2025-02-05 09:15:00', '2025-02-20 16:00:00'),  -- Số Đỏ
    (3, 1, '2025-03-20 14:20:00', NULL),                   -- Số Đỏ (chưa trả)
    (4, 2, '2025-01-20 13:00:00', '2025-02-01 10:00:00'),  -- Tắt Đèn
    (1, 3, '2025-02-15 08:30:00', '2025-02-25 15:45:00'),  -- Lão Hạc
    (1, 3, '2025-03-01 11:00:00', '2025-03-10 09:00:00'),  -- Lão Hạc
    (2, 4, '2024-12-05 16:00:00', '2024-12-12 12:00:00'),  -- Đôi Mắt
    (3, 5, '2025-02-25 10:30:00', NULL),                   -- Nỗi Buồn Chiến Tranh
    (4, 6, '2025-03-15 09:00:00', '2025-03-25 14:00:00'),  -- Cho Tôi Xin Một Vé Đi Tuổi Thơ
    (1, 6, '2025-01-10 15:00:00', '2025-01-20 11:30:00'),  -- Cho Tôi Xin Một Vé Đi Tuổi Thơ
    (1, 7, '2025-02-01 12:00:00', '2025-02-10 17:00:00'),  -- Tôi Thấy Hoa Vàng Trên Cỏ Xanh
    (2, 7, '2025-03-30 13:30:00', NULL),                   -- Tôi Thấy Hoa Vàng Trên Cỏ Xanh
    (3, 8, '2025-01-15 14:00:00', '2025-01-25 10:00:00'),  -- Dế Mèn Phiêu Lưu Ký
    (4, 9, '2025-02-10 09:45:00', '2025-02-20 15:00:00'),  -- Truyện Kiều
    (1, 10, '2025-03-25 11:15:00', NULL);                  -- Nhật Ký Trong Tù

    
CREATE INDEX idx_borrowing_user_id ON public.borrows (user_id);
    
SELECT 
    b.book_id, b2.title,
    COUNT(b.book_id) AS BorrowCount
FROM 
    public.borrows b join books b2 on b.book_id = b2.book_id
WHERE 
    b.borrowed_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY 
    b.book_id, b2.title
ORDER BY 
    BorrowCount DESC
LIMIT 5;