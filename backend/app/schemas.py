from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime
import re

class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str
    
    @validator('email')
    def validate_email(cls, v):
        if not v or not v.strip():
            raise ValueError('Email не может быть пустым')
        if len(v) > 50:
            raise ValueError('Email не может превышать 50 символов')
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Email должен содержать только латиницу')
        return v.lower()
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if not v or not v.strip():
            raise ValueError('ФИО не может быть пустым')
        
        if len(v) > 50:
            raise ValueError('ФИО не может превышать 50 символов')
        
        if not re.match(r'^[А-ЯЁа-яё\s-]+$', v):
            raise ValueError('ФИО должно содержать только кириллицу')
        
        words = v.strip().split()
        
        if len(words) < 2:
            raise ValueError('Введите минимум Фамилию и Имя (например: Иванов Иван)')
        
        for word in words:
            if len(word) < 2:
                raise ValueError('Каждое слово в ФИО должно содержать минимум 2 буквы')
        
        return ' '.join(word.capitalize() for word in words)

    
    @validator('password')
    def validate_password(cls, v):
        if not v:
            raise ValueError('Пароль не может быть пустым')
        
        errors = []
        
        if len(v) < 8:
            errors.append('минимум 8 символов')
        if len(v) > 20:
            errors.append('максимум 20 символов')
        if not re.search(r'[A-Z]', v):
            errors.append('минимум одна заглавная буква (A-Z)')
        if not re.search(r'[a-z]', v):
            errors.append('минимум одна строчная буква (a-z)')
        if not re.search(r'\d', v):
            errors.append('минимум одна цифра (0-9)')
        if not re.search(r'[!@#$%_*&?]', v):
            errors.append('минимум один спецсимвол (!@#$%_*&?)')
        
        if errors:
            raise ValueError('Пароль должен содержать: ' + ', '.join(errors))
        
        return v

class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class BookBase(BaseModel):
    title: str
    author: str
    tag: str
    genre: str
    description: Optional[str] = None

class BookCreate(BookBase):
    filename: str

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    tag: Optional[str] = None
    genre: Optional[str] = None
    description: Optional[str] = None

class BookResponse(BookBase):
    id: int
    filename: str
    created_at: datetime
    average_rating: Optional[float] = None
    is_favorite: bool = False
    is_read: bool = False
    user_rating: Optional[float] = None
    
    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    text: str

class ReviewCreate(ReviewBase):
    book_id: int

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    book_id: int
    created_at: datetime
    user_name: str
    
    class Config:
        from_attributes = True

class RatingBase(BaseModel):
    value: float = Field(..., ge=1, le=5)

class RatingCreate(RatingBase):
    book_id: int

class RatingResponse(RatingBase):
    id: int
    user_id: int
    book_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
