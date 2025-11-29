from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# Таблица для связи многие-ко-многим (избранное)
favorites = Table(
    'favorites',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('book_id', Integer, ForeignKey('books.id'), primary_key=True)
)

# Таблица для связи многие-ко-многим (прочитанные книги)
read_books = Table(
    'read_books',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('book_id', Integer, ForeignKey('books.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    favorites = relationship("Book", secondary=favorites, back_populates="favorited_by")
    read = relationship("Book", secondary=read_books, back_populates="read_by")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")

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
    
    favorited_by = relationship("User", secondary=favorites, back_populates="favorites")
    read_by = relationship("User", secondary=read_books, back_populates="read")
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="book", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="reviews")
    book = relationship("Book", back_populates="reviews")

class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    value = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="ratings")
    book = relationship("Book", back_populates="ratings")
