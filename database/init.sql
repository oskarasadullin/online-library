-- Инициализация базы данных для Online Library

-- Создание пользователя и базы данных
CREATE DATABASE library_db;
CREATE USER library_user WITH PASSWORD 'library_password';
GRANT ALL PRIVILEGES ON DATABASE library_db TO library_user;

-- Подключение к базе данных library_db
\c library_db;

-- Предоставление прав пользователю
GRANT ALL PRIVILEGES ON SCHEMA public TO library_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO library_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO library_user;

-- Установка прав по умолчанию для будущих таблиц
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO library_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO library_user;

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Для полнотекстового поиска

-- Функция для обновления timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ОСНОВНЫЕ ТАБЛИЦЫ (создаются через SQLAlchemy)
-- ============================================

-- Комментарий: Таблицы users, books, reviews, ratings, favorites, read_books
-- будут созданы автоматически через SQLAlchemy при первом запуске приложения
-- models.Base.metadata.create_all(bind=engine) в main.py

-- ============================================
-- НОВЫЕ ТАБЛИЦЫ (Закладки, Заметки, Модерация)
-- ============================================

-- Таблица закладок
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    page INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id, page)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_book ON bookmarks(book_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_book ON bookmarks(user_id, book_id);

COMMENT ON TABLE bookmarks IS 'Закладки пользователей в книгах';

-- Таблица заметок
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    page INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_book ON notes(book_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_book ON notes(user_id, book_id);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE notes IS 'Заметки пользователей к книгам';

-- Таблица жалоб на отзывы
CREATE TABLE IF NOT EXISTS review_reports (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'offensive', 'inappropriate', 'other')),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id),
    UNIQUE(review_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON review_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_review ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON review_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON review_reports(created_at DESC);

COMMENT ON TABLE review_reports IS 'Жалобы на отзывы пользователей';

-- ============================================
-- ДОПОЛНИТЕЛЬНЫЕ ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- ============================================

-- Индексы для полнотекстового поиска
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_title_trgm ON books USING gin(title gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_author_trgm ON books USING gin(author gin_trgm_ops);

-- Индексы для фильтрации
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_tag ON books(tag);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_created_at ON books(created_at DESC);

-- Индексы для отзывов и рейтингов
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_book_id ON reviews(book_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ratings_book_id ON ratings(book_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ratings_book_user ON ratings(book_id, user_id);

-- Индексы для избранного и прочитанного
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_book ON favorites(user_id, book_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_read_books_user_book ON read_books(user_id, book_id);

-- ============================================
-- СТАТИСТИКА И ПРЕДСТАВЛЕНИЯ
-- ============================================

-- Представление для статистики по книгам
CREATE OR REPLACE VIEW book_statistics AS
SELECT 
    b.id,
    b.title,
    b.author,
    COUNT(DISTINCT f.user_id) as favorites_count,
    COUNT(DISTINCT r.user_id) as reviews_count,
    AVG(rt.value) as average_rating,
    COUNT(DISTINCT rb.user_id) as read_count
FROM books b
LEFT JOIN favorites f ON b.id = f.book_id
LEFT JOIN reviews r ON b.id = r.book_id
LEFT JOIN ratings rt ON b.id = rt.book_id
LEFT JOIN read_books rb ON b.id = rb.book_id
GROUP BY b.id, b.title, b.author;

COMMENT ON VIEW book_statistics IS 'Статистика по книгам';

-- Представление для активности пользователей
CREATE OR REPLACE VIEW user_activity AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    COUNT(DISTINCT f.book_id) as favorites_count,
    COUNT(DISTINCT r.id) as reviews_count,
    COUNT(DISTINCT rt.id) as ratings_count,
    COUNT(DISTINCT rb.book_id) as read_count,
    COUNT(DISTINCT b.id) as bookmarks_count,
    COUNT(DISTINCT n.id) as notes_count
FROM users u
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN reviews r ON u.id = r.user_id
LEFT JOIN ratings rt ON u.id = rt.user_id
LEFT JOIN read_books rb ON u.id = rb.user_id
LEFT JOIN bookmarks b ON u.id = b.user_id
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.email, u.full_name;

COMMENT ON VIEW user_activity IS 'Активность пользователей';

-- ============================================
-- СОЗДАНИЕ ПЕРВОГО АДМИНА
-- ============================================

-- ВАЖНО: Сначала зарегистрируйте пользователя через API /api/auth/register
-- Затем выполните команду ниже, заменив email на нужный:
-- 
-- UPDATE users SET is_admin = true WHERE email = 'admin@library.com';

-- ============================================
-- КОММЕНТАРИИ К БАЗЕ ДАННЫХ
-- ============================================

COMMENT ON DATABASE library_db IS 'База данных онлайн-библиотеки "Пионеры Башкортостана"';

-- Вывод информации о созданных таблицах
SELECT 
    schemaname as schema,
    tablename as table_name,
    tableowner as owner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Вывод информации о созданных индексах
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
