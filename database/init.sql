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

-- Создание индексов для оптимизации поиска (будут созданы после создания таблиц через SQLAlchemy)
-- Эти команды выполнятся автоматически при первом запуске приложения

-- Функция для обновления timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Комментарий: Таблицы будут созданы автоматически через SQLAlchemy при первом запуске приложения
-- models.Base.metadata.create_all(bind=engine) в main.py

-- После создания таблиц SQLAlchemy, можно добавить дополнительные индексы для оптимизации:
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_title_trgm ON books USING gin(title gin_trgm_ops);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_author_trgm ON books USING gin(author gin_trgm_ops);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_tag ON books(tag);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_genre ON books(genre);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_book_id ON reviews(book_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ratings_book_id ON ratings(book_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_book ON favorites(user_id, book_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_read_books_user_book ON read_books(user_id, book_id);

-- Создание первого админ-пользователя (опционально)
-- Пароль будет хешироваться через API при регистрации
-- Для создания первого админа используйте API endpoint /api/auth/register
-- Затем вручную через psql установите is_admin = true:
-- UPDATE users SET is_admin = true WHERE email = 'admin@library.com';

COMMENT ON DATABASE library_db IS 'База данных онлайн-библиотеки';
