"""
Online Library API Application
Backend для онлайн-библиотеки с FastAPI
"""

__version__ = "1.0.0"
__author__ = "Online Library Team"

from .main import app
from .database import Base, engine, get_db
from . import models, schemas, crud, auth

__all__ = [
    "app",
    "Base",
    "engine",
    "get_db",
    "models",
    "schemas",
    "crud",
    "auth",
]
