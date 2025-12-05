from sqlalchemy.orm import Session
from sqlalchemy import or_, func, and_
from typing import List, Optional
from . import models, schemas
from .auth import get_password_hash

# ============ USER CRUD OPERATIONS ============

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Получить пользователя по email"""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """Получить пользователя по ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Получить список всех пользователей"""
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Создать нового пользователя"""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_admin=False  # По умолчанию не админ
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, updates: dict) -> Optional[models.User]:
    """Обновить данные пользователя"""
    user = get_user_by_id(db, user_id)
    if user:
        for key, value in updates.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
    return user

def make_admin(db: Session, user_id: int) -> Optional[models.User]:
    """Сделать пользователя администратором"""
    return update_user(db, user_id, {"is_admin": True})

def delete_user(db: Session, user_id: int) -> bool:
    """Удалить пользователя"""
    user = get_user_by_id(db, user_id)
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

# ============ BOOK CRUD OPERATIONS ============

def get_books(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    tag: Optional[str] = None,
    genre: Optional[str] = None,
    author: Optional[str] = None,
    search: Optional[str] = None,
    title: Optional[str] = None
) -> List[models.Book]:
    """
    Получить список книг с фильтрацией
    
    Args:
        db: Сессия базы данных
        skip: Количество пропускаемых записей
        limit: Максимальное количество записей
        tag: Фильтр по тегу
        genre: Фильтр по жанру
        author: Фильтр по автору
        search: Поиск по всем полям
        title: Фильтр по названию
    """
    query = db.query(models.Book)
    
    if tag:
        query = query.filter(models.Book.tag.ilike(f"%{tag}%"))
    if genre:
        query = query.filter(models.Book.genre.ilike(f"%{genre}%"))
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%"))
    if title:
        query = query.filter(models.Book.title.ilike(f"%{title}%"))
    if search:
        search_filter = or_(
            models.Book.title.ilike(f"%{search}%"),
            models.Book.description.ilike(f"%{search}%"),
            models.Book.author.ilike(f"%{search}%"),
            models.Book.tag.ilike(f"%{search}%"),
            models.Book.genre.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    return query.order_by(models.Book.created_at.desc()).offset(skip).limit(limit).all()

def get_books_count(
    db: Session,
    tag: Optional[str] = None,
    genre: Optional[str] = None,
    author: Optional[str] = None,
    search: Optional[str] = None
) -> int:
    """Получить количество книг с учетом фильтров"""
    query = db.query(func.count(models.Book.id))
    
    if tag:
        query = query.filter(models.Book.tag.ilike(f"%{tag}%"))
    if genre:
        query = query.filter(models.Book.genre.ilike(f"%{genre}%"))
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%"))
    if search:
        search_filter = or_(
            models.Book.title.ilike(f"%{search}%"),
            models.Book.description.ilike(f"%{search}%"),
            models.Book.author.ilike(f"%{search}%"),
            models.Book.tag.ilike(f"%{search}%"),
            models.Book.genre.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    return query.scalar()

def get_book(db: Session, book_id: int) -> Optional[models.Book]:
    """Получить книгу по ID"""
    return db.query(models.Book).filter(models.Book.id == book_id).first()

def get_book_by_filename(db: Session, filename: str) -> Optional[models.Book]:
    """Получить книгу по имени файла"""
    return db.query(models.Book).filter(models.Book.filename == filename).first()

def create_book(db: Session, book: schemas.BookCreate) -> models.Book:
    """Создать новую книгу"""
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def update_book(db: Session, book_id: int, book_update: schemas.BookUpdate) -> Optional[models.Book]:
    """Обновить информацию о книге"""
    db_book = get_book(db, book_id)
    if db_book:
        update_data = book_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_book, field, value)
        db.commit()
        db.refresh(db_book)
    return db_book

def delete_book(db: Session, book_id: int) -> bool:
    """Удалить книгу"""
    db_book = get_book(db, book_id)
    if db_book:
        db.delete(db_book)
        db.commit()
        return True
    return False

# ============ RATING OPERATIONS ============

def get_book_average_rating(db: Session, book_id: int) -> Optional[float]:
    """Получить средний рейтинг книги"""
    result = db.query(func.avg(models.Rating.value)).filter(
        models.Rating.book_id == book_id
    ).scalar()
    return round(result, 2) if result else None

def get_book_ratings_count(db: Session, book_id: int) -> int:
    """Получить количество оценок книги"""
    return db.query(func.count(models.Rating.id)).filter(
        models.Rating.book_id == book_id
    ).scalar()

def get_user_rating_for_book(db: Session, user_id: int, book_id: int) -> Optional[float]:
    """Получить оценку пользователя для книги"""
    rating = db.query(models.Rating).filter(
        and_(
            models.Rating.user_id == user_id,
            models.Rating.book_id == book_id
        )
    ).first()
    return rating.value if rating else None

def create_or_update_rating(db: Session, user_id: int, rating_data: schemas.RatingCreate) -> models.Rating:
    """Создать или обновить оценку книги"""
    existing_rating = db.query(models.Rating).filter(
        and_(
            models.Rating.user_id == user_id,
            models.Rating.book_id == rating_data.book_id
        )
    ).first()
    
    if existing_rating:
        existing_rating.value = rating_data.value
        db.commit()
        db.refresh(existing_rating)
        return existing_rating
    else:
        db_rating = models.Rating(user_id=user_id, **rating_data.dict())
        db.add(db_rating)
        db.commit()
        db.refresh(db_rating)
        return db_rating

def delete_rating(db: Session, user_id: int, book_id: int) -> bool:
    """Удалить оценку пользователя"""
    rating = db.query(models.Rating).filter(
        and_(
            models.Rating.user_id == user_id,
            models.Rating.book_id == book_id
        )
    ).first()
    
    if rating:
        db.delete(rating)
        db.commit()
        return True
    return False

# ============ FAVORITE OPERATIONS ============

def add_to_favorites(db: Session, user_id: int, book_id: int) -> bool:
    """Добавить книгу в избранное"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    
    if user and book:
        if book not in user.favorites:
            user.favorites.append(book)
            db.commit()
            return True
    return False

def remove_from_favorites(db: Session, user_id: int, book_id: int) -> bool:
    """Удалить книгу из избранного"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    
    if user and book:
        if book in user.favorites:
            user.favorites.remove(book)
            db.commit()
            return True
    return False

def get_user_favorites(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    tag: Optional[str] = None,
    genre: Optional[str] = None,
    author: Optional[str] = None,
    search: Optional[str] = None
) -> List[models.Book]:
    """Получить избранные книги пользователя с фильтрацией"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        return []
    
    query = db.query(models.Book).join(
        models.favorites,
        models.Book.id == models.favorites.c.book_id
    ).filter(
        models.favorites.c.user_id == user_id
    )
    
    if tag:
        query = query.filter(models.Book.tag.ilike(f"%{tag}%"))
    if genre:
        query = query.filter(models.Book.genre.ilike(f"%{genre}%"))
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%"))
    if search:
        search_filter = or_(
            models.Book.title.ilike(f"%{search}%"),
            models.Book.description.ilike(f"%{search}%"),
            models.Book.author.ilike(f"%{search}%"),
            models.Book.tag.ilike(f"%{search}%"),
            models.Book.genre.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    return query.offset(skip).limit(limit).all()

def is_favorite(db: Session, user_id: int, book_id: int) -> bool:
    """Проверить, находится ли книга в избранном"""
    count = db.query(func.count(models.favorites.c.user_id)).filter(
        and_(
            models.favorites.c.user_id == user_id,
            models.favorites.c.book_id == book_id
        )
    ).scalar()
    return count > 0

# ============ READ STATUS OPERATIONS ============

def mark_as_read(db: Session, user_id: int, book_id: int) -> bool:
    """Отметить книгу как прочитанную"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    
    if user and book:
        if book not in user.read:
            user.read.append(book)
            db.commit()
            return True
    return False

def mark_as_unread(db: Session, user_id: int, book_id: int) -> bool:
    """Отметить книгу как непрочитанную"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    
    if user and book:
        if book in user.read:
            user.read.remove(book)
            db.commit()
            return True
    return False

def get_user_read_books(db: Session, user_id: int) -> List[models.Book]:
    """Получить прочитанные книги пользователя"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user.read if user else []

def is_read(db: Session, user_id: int, book_id: int) -> bool:
    """Проверить, прочитана ли книга"""
    count = db.query(func.count(models.read_books.c.user_id)).filter(
        and_(
            models.read_books.c.user_id == user_id,
            models.read_books.c.book_id == book_id
        )
    ).scalar()
    return count > 0

# ============ REVIEW OPERATIONS ============

def create_review(db: Session, user_id: int, review: schemas.ReviewCreate) -> models.Review:
    """Создать отзыв на книгу"""
    db_review = models.Review(user_id=user_id, **review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_book_reviews(db: Session, book_id: int, skip: int = 0, limit: int = 100) -> List[models.Review]:
    """Получить отзывы на книгу"""
    return db.query(models.Review).filter(
        models.Review.book_id == book_id
    ).order_by(
        models.Review.created_at.desc()
    ).offset(skip).limit(limit).all()

def get_user_reviews(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Review]:
    """Получить отзывы пользователя"""
    return db.query(models.Review).filter(
        models.Review.user_id == user_id
    ).order_by(
        models.Review.created_at.desc()
    ).offset(skip).limit(limit).all()

def get_review(db: Session, review_id: int) -> Optional[models.Review]:
    """Получить отзыв по ID"""
    return db.query(models.Review).filter(models.Review.id == review_id).first()

def update_review(db: Session, review_id: int, text: str) -> Optional[models.Review]:
    """Обновить текст отзыва"""
    review = get_review(db, review_id)
    if review:
        review.text = text
        db.commit()
        db.refresh(review)
    return review

def delete_review(db: Session, review_id: int) -> bool:
    """Удалить отзыв"""
    review = get_review(db, review_id)
    if review:
        db.delete(review)
        db.commit()
        return True
    return False

# ============ FILTER OPTIONS ============

def get_all_tags(db: Session) -> List[str]:
    """Получить все уникальные теги"""
    tags = db.query(models.Book.tag).distinct().order_by(models.Book.tag).all()
    return [tag[0] for tag in tags if tag[0]]

def get_all_genres(db: Session) -> List[str]:
    """Получить все уникальные жанры"""
    genres = db.query(models.Book.genre).distinct().order_by(models.Book.genre).all()
    return [genre[0] for genre in genres if genre[0]]

def get_all_authors(db: Session) -> List[str]:
    """Получить всех уникальных авторов"""
    authors = db.query(models.Book.author).distinct().order_by(models.Book.author).all()
    return [author[0] for author in authors if author[0]]

# ============ STATISTICS ============

def get_total_books_count(db: Session) -> int:
    """Получить общее количество книг"""
    return db.query(func.count(models.Book.id)).scalar()

def get_total_users_count(db: Session) -> int:
    """Получить общее количество пользователей"""
    return db.query(func.count(models.User.id)).scalar()

def get_total_reviews_count(db: Session) -> int:
    """Получить общее количество отзывов"""
    return db.query(func.count(models.Review.id)).scalar()

def get_user_statistics(db: Session, user_id: int) -> dict:
    """Получить статистику пользователя"""
    favorites_count = db.query(func.count(models.favorites.c.book_id)).filter(
        models.favorites.c.user_id == user_id
    ).scalar()
    
    read_count = db.query(func.count(models.read_books.c.book_id)).filter(
        models.read_books.c.user_id == user_id
    ).scalar()
    
    reviews_count = db.query(func.count(models.Review.id)).filter(
        models.Review.user_id == user_id
    ).scalar()
    
    ratings_count = db.query(func.count(models.Rating.id)).filter(
        models.Rating.user_id == user_id
    ).scalar()
    
    return {
        "favorites_count": favorites_count or 0,
        "read_count": read_count or 0,
        "reviews_count": reviews_count or 0,
        "ratings_count": ratings_count or 0
    }

# Добавить в конец файла

# ============ MODERATION OPERATIONS ============

def create_review_report(
    db: Session,
    review_id: int,
    reporter_id: int,
    reason: str,
    comment: Optional[str] = None
) -> models.ReviewReport:
    """Создать жалобу на отзыв"""
    # Проверяем, не жаловался ли уже этот пользователь
    existing = db.query(models.ReviewReport).filter(
        and_(
            models.ReviewReport.review_id == review_id,
            models.ReviewReport.reporter_id == reporter_id
        )
    ).first()
    
    if existing:
        return existing
    
    report = models.ReviewReport(
        review_id=review_id,
        reporter_id=reporter_id,
        reason=reason,
        comment=comment
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

def get_pending_reports(db: Session, skip: int = 0, limit: int = 100) -> List[models.ReviewReport]:
    """Получить список необработанных жалоб"""
    return db.query(models.ReviewReport).filter(
        models.ReviewReport.status == "pending"
    ).order_by(
        models.ReviewReport.created_at.desc()
    ).offset(skip).limit(limit).all()

def get_report_by_id(db: Session, report_id: int) -> Optional[models.ReviewReport]:
    """Получить жалобу по ID"""
    return db.query(models.ReviewReport).filter(
        models.ReviewReport.id == report_id
    ).first()

def resolve_report(
    db: Session,
    report_id: int,
    admin_id: int,
    action: str  # dismiss, delete_review
) -> Optional[models.ReviewReport]:
    """Обработать жалобу"""
    report = get_report_by_id(db, report_id)
    if not report:
        return None
    
    report.status = "resolved" if action == "dismiss" else "resolved"
    report.resolved_at = datetime.utcnow()
    report.resolved_by = admin_id
    
    # Если нужно удалить отзыв
    if action == "delete_review":
        delete_review(db, report.review_id)
    
    db.commit()
    db.refresh(report)
    return report

def get_reports_count(db: Session) -> dict:
    """Получить статистику по жалобам"""
    total = db.query(func.count(models.ReviewReport.id)).scalar()
    pending = db.query(func.count(models.ReviewReport.id)).filter(
        models.ReviewReport.status == "pending"
    ).scalar()
    resolved = db.query(func.count(models.ReviewReport.id)).filter(
        models.ReviewReport.status == "resolved"
    ).scalar()
    
    return {
        "total": total or 0,
        "pending": pending or 0,
        "resolved": resolved or 0
    }

# ============ BOOKMARKS OPERATIONS ============

def get_user_bookmarks(db: Session, user_id: int, book_id: int) -> List[models.Bookmark]:
    """Получить закладки пользователя для книги"""
    return db.query(models.Bookmark).filter(
        and_(
            models.Bookmark.user_id == user_id,
            models.Bookmark.book_id == book_id
        )
    ).order_by(models.Bookmark.page).all()

def add_bookmark(db: Session, user_id: int, book_id: int, page: int) -> models.Bookmark:
    """Добавить закладку"""
    # Проверяем, не существует ли уже
    existing = db.query(models.Bookmark).filter(
        and_(
            models.Bookmark.user_id == user_id,
            models.Bookmark.book_id == book_id,
            models.Bookmark.page == page
        )
    ).first()
    
    if existing:
        return existing
    
    bookmark = models.Bookmark(user_id=user_id, book_id=book_id, page=page)
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark

def remove_bookmark(db: Session, user_id: int, book_id: int, page: int) -> bool:
    """Удалить закладку"""
    bookmark = db.query(models.Bookmark).filter(
        and_(
            models.Bookmark.user_id == user_id,
            models.Bookmark.book_id == book_id,
            models.Bookmark.page == page
        )
    ).first()
    
    if bookmark:
        db.delete(bookmark)
        db.commit()
        return True
    return False

# ============ NOTES OPERATIONS ============

def get_user_notes(db: Session, user_id: int, book_id: int) -> List[models.Note]:
    """Получить заметки пользователя для книги"""
    return db.query(models.Note).filter(
        and_(
            models.Note.user_id == user_id,
            models.Note.book_id == book_id
        )
    ).order_by(models.Note.page).all()

def create_note(
    db: Session,
    user_id: int,
    book_id: int,
    page: int,
    text: str
) -> models.Note:
    """Создать заметку"""
    note = models.Note(user_id=user_id, book_id=book_id, page=page, text=text)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def update_note(db: Session, note_id: int, text: str) -> Optional[models.Note]:
    """Обновить заметку"""
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if note:
        note.text = text
        note.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(note)
    return note

def delete_note(db: Session, note_id: int, user_id: int) -> bool:
    """Удалить заметку"""
    note = db.query(models.Note).filter(
        and_(
            models.Note.id == note_id,
            models.Note.user_id == user_id
        )
    ).first()
    
    if note:
        db.delete(note)
        db.commit()
        return True
    return False
