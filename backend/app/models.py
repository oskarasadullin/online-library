from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# Таблица для связи многие-ко-многим (избранное)
favorites = Table(
    'favorites',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('book_id', Integer, ForeignKey('books.id', ondelete='CASCADE'), primary_key=True)
)

# Таблица для связи многие-ко-многим (прочитанные книги)
read_books = Table(
    'read_books',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('book_id', Integer, ForeignKey('books.id', ondelete='CASCADE'), primary_key=True)
)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    favorites = relationship("Book", secondary=favorites, back_populates="favorited_by")
    read = relationship("Book", secondary=read_books, back_populates="read_by")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    reported_reviews = relationship("ReviewReport", foreign_keys="ReviewReport.reporter_id", back_populates="reporter", cascade="all, delete-orphan")
    resolved_reports = relationship("ReviewReport", foreign_keys="ReviewReport.resolved_by", back_populates="resolver")


class Book(Base):
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    tag = Column(String, nullable=False)
    genre = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    favorited_by = relationship("User", secondary=favorites, back_populates="favorites")
    read_by = relationship("User", secondary=read_books, back_populates="read")
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="book", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="book", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="book", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    book = relationship("Book", back_populates="reviews")
    reports = relationship("ReviewReport", back_populates="review", cascade="all, delete-orphan")


class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    value = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="ratings")
    book = relationship("Book", back_populates="ratings")


class Bookmark(Base):
    __tablename__ = "bookmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    page = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="bookmarks")
    book = relationship("Book", back_populates="bookmarks")


class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    page = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notes")
    book = relationship("Book", back_populates="notes")


class ReviewReport(Base):
    __tablename__ = "review_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String, nullable=False)  # spam, offensive, inappropriate, other
    comment = Column(Text)
    status = Column(String, default="pending")  # pending, resolved, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    resolved_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    review = relationship("Review", back_populates="reports")
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_reviews")
    resolver = relationship("User", foreign_keys=[resolved_by], back_populates="resolved_reports")
