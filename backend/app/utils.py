import os
import re
from typing import Tuple, List
from .config import settings

def parse_book_filename(filename: str) -> Tuple[str, str, str, str]:
    """
    Парсит имя файла в формате #ТЭГ_#ЖАНР_Название_книги,_Имя_Автора.pdf
    """
    # Убираем .pdf
    name_without_ext = filename.rsplit('.', 1)[0]
    
    # Разбиваем по #
    parts = name_without_ext.split('#')
    
    if len(parts) < 3:
        return ("Unknown", "Unknown", filename, "Unknown")
    
    # Тег
    tag = parts[1].rstrip('_').strip()
    
    # Остальное
    remaining = parts[2]
    
    # Разделяем по запятой (название, автор)
    if ',' in remaining:
        before_comma, after_comma = remaining.split(',', 1)
        
        # Жанр и название до запятой
        remaining_parts = before_comma.split('_')
        genre = remaining_parts[0].strip()
        title = ' '.join(remaining_parts[1:]).strip() if len(remaining_parts) > 1 else "Unknown"
        
        # Автор после запятой
        author = after_comma.lstrip('_').replace('_', ' ').strip()
    else:
        # Старый формат без запятой
        remaining_parts = remaining.split('_')
        genre = remaining_parts[0].strip() if len(remaining_parts) > 0 else "Unknown"
        author = remaining_parts[-1].strip() if len(remaining_parts) > 1 else "Unknown"
        title_parts = remaining_parts[1:-1]
        title = ' '.join(title_parts).strip() if title_parts else "Unknown"
    
    return (tag, genre, title, author)


def get_books_from_directory() -> List[dict]:
    """
    Сканирует директорию books и возвращает список книг с их метаданными
    """
    books = []
    books_dir = settings.BOOKS_DIRECTORY
    
    if not os.path.exists(books_dir):
        os.makedirs(books_dir)
        return books
    
    for filename in os.listdir(books_dir):
        if filename.endswith('.pdf'):
            tag, genre, title, author = parse_book_filename(filename)
            books.append({
                'filename': filename,
                'tag': tag,
                'genre': genre,
                'title': title,
                'author': author
            })
    
    return books
