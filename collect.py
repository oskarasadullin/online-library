import os
from pathlib import Path

# Что игнорировать
IGNORE_DIRS = {'node_modules', 'dist', 'build', '.git', 'postgres_data', '__pycache__', '.vscode'}
IGNORE_FILES = {'package-lock.json', 'package.json'}
IGNORE_EXTENSIONS = {'.log', '.jpg', '.jpeg', '.png', '.svg', '.ico', '.map'}

OUTPUT_FILE = 'project_code.txt'

def should_ignore(path):
    """Проверяем, нужно ли игнорировать файл/папку"""
    parts = Path(path).parts
    
    # Игнорируем папки
    if any(ignored in parts for ignored in IGNORE_DIRS):
        return True
    
    # Игнорируем файлы по имени
    if Path(path).name in IGNORE_FILES:
        return True
    
    # Игнорируем по расширению
    if Path(path).suffix in IGNORE_EXTENSIONS:
        return True
    
    return False

def collect_files(root_dir='.'):
    """Собираем все файлы проекта"""
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as output:
        for root, dirs, files in os.walk(root_dir):
            # Удаляем игнорируемые директории из обхода
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                file_path = os.path.join(root, file)
                
                if should_ignore(file_path):
                    continue
                
                try:
                    print(f"Обрабатываю: {file_path}")
                    output.write(f"\n==== FILE: {file_path} ====\n")
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        output.write(content)
                        output.write("\n\n")
                
                except Exception as e:
                    print(f"Ошибка при чтении {file_path}: {e}")
                    output.write(f"[ОШИБКА ЧТЕНИЯ: {e}]\n\n")

if __name__ == '__main__':
    print(f"Собираю код в {OUTPUT_FILE}...")
    collect_files()
    print(f"Готово! Файл сохранён в {OUTPUT_FILE}")
