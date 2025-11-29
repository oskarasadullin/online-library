from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Query, Request, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from collections import defaultdict
import time
from datetime import timedelta

from . import models, schemas, crud, auth
from .database import engine, get_db
from .config import settings
from .utils import parse_book_filename, get_books_from_directory

# Создание таблиц
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Online Library API", version="1.0.0")

# Rate limiter для авторизации
login_attempts = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # секунды
RATE_LIMIT_MAX_ATTEMPTS = 5

def check_rate_limit(ip: str) -> bool:
    """Проверка лимита запросов. Возвращает True если лимит превышен."""
    now = time.time()
    login_attempts[ip] = [t for t in login_attempts[ip] if now - t < RATE_LIMIT_WINDOW]
    
    if len(login_attempts[ip]) >= RATE_LIMIT_MAX_ATTEMPTS:
        return True
    
    login_attempts[ip].append(now)
    return False

# Rate limiters для различных действий
review_attempts = defaultdict(list)
rating_attempts = defaultdict(list)
download_attempts = defaultdict(list)
view_attempts = defaultdict(list)

def check_action_rate_limit(user_id: int, action_dict: dict, window: int, max_attempts: int) -> bool:
    """Универсальная функция для проверки rate limit по действиям пользователя."""
    now = time.time()
    key = str(user_id)
    
    # Очищаем старые попытки
    action_dict[key] = [t for t in action_dict[key] if now - t < window]
    
    # Проверяем лимит
    if len(action_dict[key]) >= max_attempts:
        return True
    
    # Добавляем текущую попытку
    action_dict[key].append(now)
    return False


# ============ ОБРАБОТЧИКИ ОШИБОК ============

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = error.get("loc")[-1] if error.get("loc") else "unknown"
        msg = error.get("msg", "")
        
        # Обрабатываем разные типы ошибок
        if "valid email" in msg.lower():
            errors.append("Неверный формат email")
        elif "field required" in msg.lower():
            errors.append("Поле обязательно для заполнения")
        elif "none is not an allowed value" in msg.lower():
            errors.append("Поле не может быть пустым")
        elif "Value error" in msg:
            # Извлекаем текст после "Value error, "
            clean_msg = msg.replace("Value error, ", "")
            errors.append(clean_msg)
        else:
            # Для всех остальных случаев - только сообщение без имени поля
            errors.append(msg)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "\n".join(errors) if errors else "Ошибка валидации"}
    )


# ============ CORS НАСТРОЙКИ ============

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost",
        "http://192.168.88.228:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание директории для книг
os.makedirs(settings.BOOKS_DIRECTORY, exist_ok=True)

# ============ AUTH ENDPOINTS ============

@app.post("/api/auth/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, request: Request, db: Session = Depends(get_db)):
    # Rate limiting
    if check_rate_limit(request.client.host):
        raise HTTPException(status_code=429, detail="Превышен лимит попыток регистрации. Попробуйте через минуту")
    
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    try:
        return crud.create_user(db=db, user=user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка создания пользователя: {str(e)}")


@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_login: schemas.UserLogin, request: Request, db: Session = Depends(get_db)):
    # Rate limiting
    if check_rate_limit(request.client.host):
        raise HTTPException(status_code=429, detail="Превышен лимит попыток входа. Попробуйте через минуту")
    
    user = crud.get_user_by_email(db, email=user_login.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")
    if not auth.verify_password(user_login.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=schemas.User)
def get_current_user_info(current_user: models.User = Depends(auth.get_current_user)):
    """Получить информацию о текущем пользователе"""
    return current_user

# ============ BOOK ENDPOINTS ============

@app.get("/api/books", response_model=List[schemas.BookResponse])
def get_books(
    skip: int = 0,
    limit: int = 100,
    tag: Optional[str] = None,
    genre: Optional[str] = None,
    author: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user)
):
    """Получить список книг с фильтрацией"""
    books = crud.get_books(db, skip=skip, limit=limit, tag=tag, genre=genre, author=author, search=search)
    
    result = []
    for book in books:
        book_data = schemas.BookResponse(
            id=book.id,
            filename=book.filename,
            title=book.title,
            author=book.author,
            tag=book.tag,
            genre=book.genre,
            description=book.description,
            created_at=book.created_at,
            average_rating=crud.get_book_average_rating(db, book.id),
            is_favorite=crud.is_favorite(db, current_user.id, book.id) if current_user else False,
            is_read=crud.is_read(db, current_user.id, book.id) if current_user else False,
            user_rating=crud.get_user_rating_for_book(db, current_user.id, book.id) if current_user else None
        )
        result.append(book_data)
    
    return result

@app.get("/api/books/{book_id}", response_model=schemas.BookResponse)
def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user)
):
    """Получить информацию о книге"""
    book = crud.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    return schemas.BookResponse(
        id=book.id,
        filename=book.filename,
        title=book.title,
        author=book.author,
        tag=book.tag,
        genre=book.genre,
        description=book.description,
        created_at=book.created_at,
        average_rating=crud.get_book_average_rating(db, book.id),
        is_favorite=crud.is_favorite(db, current_user.id, book.id) if current_user else False,
        is_read=crud.is_read(db, current_user.id, book.id) if current_user else False,
        user_rating=crud.get_user_rating_for_book(db, current_user.id, book.id) if current_user else None
    )

@app.get("/api/books/{book_id}/download")
def download_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user)  # Опциональная!
):
    # Rate limiting ТОЛЬКО для авторизованных
    if current_user and check_action_rate_limit(current_user.id, download_attempts, 30, 1):
        raise HTTPException(
            status_code=429,
            detail="Вы можете скачивать файлы не чаще 1 раза в 30 секунд. Подождите."
        )
    
    book = crud.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    file_path = os.path.join(settings.BOOKS_DIRECTORY, book.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Файл не найден")
    
    return FileResponse(file_path, media_type="application/pdf", filename=book.filename)



@app.get("/api/books/{book_id}/view")
def view_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user)  # Опциональная!
):
    # Rate limiting ТОЛЬКО для авторизованных
    if current_user and check_action_rate_limit(current_user.id, view_attempts, 30, 1):
        raise HTTPException(
            status_code=429,
            detail="Вы можете открывать книги для чтения не чаще 1 раза в 30 секунд. Подождите."
        )
    
    book = crud.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    file_path = os.path.join(settings.BOOKS_DIRECTORY, book.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Файл не найден")
    
    return FileResponse(file_path, media_type="application/pdf")


@app.post("/api/books/sync")
def sync_books(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Синхронизация книг из директории с базой данных (только для админов)"""
    try:
        books_from_dir = get_books_from_directory()
        synced_count = 0
        
        for book_data in books_from_dir:
            existing_book = crud.get_book_by_filename(db, book_data['filename'])
            if not existing_book:
                book_create = schemas.BookCreate(**book_data, description="")
                crud.create_book(db, book_create)
                synced_count += 1
        
        return {"message": f"Синхронизировано {synced_count} новых книг"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при синхронизации: {str(e)}"
        )

@app.post("/api/books", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
async def createbook(
    file: UploadFile = File(...),
    tag: str = Form(...),           # ✅ ИСПРАВЛЕНО
    genre: str = Form(...),         # ✅ ИСПРАВЛЕНО
    title: str = Form(...),         # ✅ ИСПРАВЛЕНО
    author: str = Form(...),        # ✅ ИСПРАВЛЕНО
    description: str = Form(...),   # ✅ ИСПРАВЛЕНО
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Загрузка новой книги (только для админов)"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Можно загружать только PDF файлы"
        )
    
    # Формируем имя файла
    filename = f"#{tag}_#{genre}_{title.replace(' ', '_')}_{author.replace(' ', '_')}.pdf"
    
    # Проверяем, существует ли уже такая книга
    existing_book = crud.get_book_by_filename(db, filename)
    if existing_book:
        raise HTTPException(
            status_code=400,
            detail="Книга с таким именем уже существует"
        )
    
    try:
        # Сохраняем файл
        file_path = os.path.join(settings.BOOKS_DIRECTORY, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Создаем запись в БД
        book_create = schemas.BookCreate(
            filename=filename,
            tag=tag,
            genre=genre,
            title=title,
            author=author,
            description=description
        )
        book = crud.create_book(db, book_create)
        
        return schemas.BookResponse(
            id=book.id,
            filename=book.filename,
            title=book.title,
            author=book.author,
            tag=book.tag,
            genre=book.genre,
            description=book.description,
            created_at=book.created_at,
            average_rating=None,
            is_favorite=False,
            is_read=False,
            user_rating=None
        )
    except Exception as e:
        # Удаляем файл если произошла ошибка
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при загрузке книги: {str(e)}"
        )

@app.put("/api/books/{book_id}", response_model=schemas.BookResponse)
def update_book(
    book_id: int,
    book_update: schemas.BookUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Обновление информации о книге (только для админов)"""
    book = crud.update_book(db, book_id, book_update)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    return schemas.BookResponse(
        id=book.id,
        filename=book.filename,
        title=book.title,
        author=book.author,
        tag=book.tag,
        genre=book.genre,
        description=book.description,
        created_at=book.created_at,
        average_rating=crud.get_book_average_rating(db, book.id),
        is_favorite=False,
        is_read=False,
        user_rating=None
    )

@app.delete("/api/books/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Удаление книги (только для админов)"""
    book = crud.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    # Удаляем файл
    file_path = os.path.join(settings.BOOKS_DIRECTORY, book.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Удаляем запись из БД
    crud.delete_book(db, book_id)
    
    return {"message": "Книга успешно удалена"}

# ============ FAVORITES ENDPOINTS ============

@app.post("/api/favorites/{book_id}")
def add_to_favorites(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Добавить книгу в избранное"""
    if not crud.add_to_favorites(db, current_user.id, book_id):
        raise HTTPException(status_code=400, detail="Не удалось добавить в избранное")
    return {"message": "Книга добавлена в избранное"}

@app.delete("/api/favorites/{book_id}")
def remove_from_favorites(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Удалить книгу из избранного"""
    if not crud.remove_from_favorites(db, current_user.id, book_id):
        raise HTTPException(status_code=400, detail="Не удалось удалить из избранного")
    return {"message": "Книга удалена из избранного"}

@app.get("/api/favorites", response_model=List[schemas.BookResponse])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Получить список избранных книг"""
    books = crud.get_user_favorites(db, current_user.id)
    
    result = []
    for book in books:
        book_data = schemas.BookResponse(
            id=book.id,
            filename=book.filename,
            title=book.title,
            author=book.author,
            tag=book.tag,
            genre=book.genre,
            description=book.description,
            created_at=book.created_at,
            average_rating=crud.get_book_average_rating(db, book.id),
            is_favorite=True,
            is_read=crud.is_read(db, current_user.id, book.id),
            user_rating=crud.get_user_rating_for_book(db, current_user.id, book.id)
        )
        result.append(book_data)
    
    return result

# ============ READ STATUS ENDPOINTS ============

@app.post("/api/read/{book_id}")
def mark_as_read(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Отметить книгу как прочитанную"""
    if not crud.mark_as_read(db, current_user.id, book_id):
        raise HTTPException(status_code=400, detail="Не удалось отметить как прочитанное")
    return {"message": "Книга отмечена как прочитанная"}

@app.delete("/api/read/{book_id}")
def mark_as_unread(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Отметить книгу как непрочитанную"""
    if not crud.mark_as_unread(db, current_user.id, book_id):
        raise HTTPException(status_code=400, detail="Не удалось отметить как непрочитанное")
    return {"message": "Книга отмечена как непрочитанная"}

# ============ REVIEWS ENDPOINTS ============

# REVIEWS ENDPOINTS
@app.post("/api/reviews", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Rate limiting - 1 отзыв в минуту
    if check_action_rate_limit(current_user.id, review_attempts, 60, 1):
        raise HTTPException(
            status_code=429,
            detail="Вы можете оставлять не более 1 отзыва в минуту. Подождите немного."
        )
    
    db_review = crud.create_review(db, current_user.id, review)
    return schemas.ReviewResponse(
        id=db_review.id,
        user_id=db_review.user_id,
        book_id=db_review.book_id,
        text=db_review.text,
        created_at=db_review.created_at,
        user_name=current_user.full_name  # ✅ full_name (с подчеркиванием!)
    )

@app.get("/api/reviews/{book_id}", response_model=List[schemas.ReviewResponse])
def get_book_reviews(book_id: int, db: Session = Depends(get_db)):
    reviews = crud.get_book_reviews(db, book_id)
    return [
        schemas.ReviewResponse(
            id=review.id,
            user_id=review.user_id,
            book_id=review.book_id,
            text=review.text,
            created_at=review.created_at,
            user_name=review.user.full_name  # ✅ full_name (с подчеркиванием!)
        ) for review in reviews
    ]


# ============ RATINGS ENDPOINTS ============

@app.post("/api/ratings", response_model=schemas.RatingResponse)
def create_or_update_rating(
    rating: schemas.RatingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Rate limiting - 1 оценка в минуту
    if check_action_rate_limit(current_user.id, rating_attempts, 60, 1):
        raise HTTPException(
            status_code=429,
            detail="Вы можете ставить оценки не чаще 1 раза в минуту. Подождите немного."
        )
    
    db_rating = crud.create_or_update_rating(db, current_user.id, rating)
    return schemas.RatingResponse(
        id=db_rating.id,
        user_id=db_rating.user_id,
        book_id=db_rating.book_id,
        value=db_rating.value,
        created_at=db_rating.created_at
    )


# ============ FILTERS ENDPOINTS ============

@app.get("/api/filters/tags")
def get_tags(db: Session = Depends(get_db)):
    """Получить список всех тегов"""
    return {"tags": crud.get_all_tags(db)}

@app.get("/api/filters/genres")
def get_genres(db: Session = Depends(get_db)):
    """Получить список всех жанров"""
    return {"genres": crud.get_all_genres(db)}

@app.get("/api/filters/authors")
def get_authors(db: Session = Depends(get_db)):
    """Получить список всех авторов"""
    return {"authors": crud.get_all_authors(db)}

@app.get("/api/health")
def health_check():
    """Проверка здоровья API"""
    return {"status": "ok", "message": "API работает"}
