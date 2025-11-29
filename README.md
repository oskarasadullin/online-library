# Онлайн-библиотека

Современная онлайн-библиотека с возможностью просмотра, скачивания и оценки книг.

## Технологии

- **Backend**: FastAPI, PostgreSQL, SQLAlchemy
- **Frontend**: React, React Router
- **Containerization**: Docker, Docker Compose

## Быстрый старт

### Предварительные требования

- Docker
- Docker Compose

### Установка и запуск

1. Клонируйте репозиторий
2. Создайте директорию для книг:
mkdir books

3. Поместите PDF файлы в формате `#ТЭГ_#ЖАНР_Название_книги_Автор.pdf` в директорию `books/`

4. Запустите проект:
docker-compose up --build

5. Откройте браузер:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Создание первого админа

1. Зарегистрируйтесь через веб-интерфейс
2. Подключитесь к базе данных:
docker exec -it library_db psql -U library_user -d library_db

3. Сделайте пользователя администратором:
UPDATE users SET is_admin = true WHERE email = 'ваш@email.com';

## Функционал

- Просмотр каталога книг
- Поиск и фильтрация
- Онлайн-чтение PDF
- Скачивание книг
- Система рейтингов и отзывов
- Избранное
- Отметка прочитанных книг
- Админ-панель для управления книгами
- Светлая/темная тема

## Структура проекта

online-library/
├── backend/ # FastAPI приложение
├── frontend/ # React приложение
├── database/ # SQL скрипты
├── books/ # Директория с PDF книгами
└── docker-compose.yml

## Лицензия

MIT