import os
from pathlib import Path

# Что игнорировать
IGNORE_DIRS = {
    'node_modules', 'dist', 'build', '.git',
    'postgres_data', '__pycache__', '.vscode', '.idea'
}
IGNORE_FILES = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'package.json', 'project_code.txt'
}
IGNORE_EXTENSIONS = {
    '.log', '.jpg', '.jpeg', '.png', '.svg', '.ico',
    '.map', '.pdf', '.mp4', '.mp3', '.woff', '.woff2',
    '.ttf', '.eot'
}

OUTPUT_FILE = 'project_code.txt'


def should_ignore(path: Path) -> bool:
    """Нужно ли игнорировать файл/папку."""
    parts = path.parts

    # Игнорируем папки
    if any(part in IGNORE_DIRS for part in parts):
        return True

    # Игнорируем файлы по имени
    if path.name in IGNORE_FILES:
        return True

    # Игнорируем по расширению
    if path.suffix in IGNORE_EXTENSIONS:
        return True

    return False


def build_tree(root_dir: Path) -> str:
    """
    Строит текстовое дерево проекта (как `tree` в терминале),
    с относительными путями, чтобы ИИ видел структуру.
    """
    lines = []
    root_dir = root_dir.resolve()
    prefix_cache = {}

    for current_root, dirs, files in os.walk(root_dir):
        # Фильтруем директории (чтобы os.walk в них не заходил)
        dirs[:] = [d for d in dirs
                   if not should_ignore(Path(current_root) / d)]

        rel_root = Path(current_root).relative_to(root_dir)
        depth = len(rel_root.parts)

        # Корневую директорию тоже показываем
        indent = '    ' * depth
        dir_name = '.' if rel_root == Path('.') else rel_root.name
        dir_line = f"{indent}{dir_name}/"
        if dir_line not in prefix_cache:
            lines.append(dir_line)
            prefix_cache[dir_line] = True

        # Файлы в этой директории
        for f in sorted(files):
            file_path = Path(current_root) / f
            if should_ignore(file_path):
                continue
            file_rel = file_path.relative_to(root_dir)
            file_indent = '    ' * (len(file_rel.parts) - 1)
            lines.append(f"{file_indent}{file_rel.name}")

    return "\n".join(lines)


def collect_files(root_dir: Path = Path('.')) -> None:
    """Собираем дерево + содержимое всех нужных файлов проекта."""
    root_dir = root_dir.resolve()

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as output:
        # 1) Пишем информацию о корне
        output.write("# PROJECT ROOT\n")
        output.write(f"{root_dir}\n\n")

        # 2) Пишем дерево проекта
        output.write("# PROJECT TREE (relative paths)\n")
        output.write("# Формат: директории заканчиваются на '/', файлы — обычные строки\n\n")
        tree_text = build_tree(root_dir)
        output.write(tree_text)
        output.write("\n\n")

        # 3) Пишем содержимое файлов
        output.write("# FILE CONTENTS\n")
        output.write("# Далее идут файлы в формате:\n")
        output.write("# ==== FILE: relative/path/to/file.ext ====\n")
        output.write("# <содержимое файла>\n\n")

        for current_root, dirs, files in os.walk(root_dir):
            # Фильтруем директории
            dirs[:] = [d for d in dirs
                       if not should_ignore(Path(current_root) / d)]

            for file in sorted(files):
                file_path = Path(current_root) / file
                if should_ignore(file_path):
                    continue

                rel_path = file_path.relative_to(root_dir)

                try:
                    print(f"Обрабатываю: {rel_path}")
                    output.write(f"\n==== FILE: {rel_path} ====\n")

                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        output.write(content)
                        output.write("\n")
                except Exception as e:
                    print(f"Ошибка при чтении {rel_path}: {e}")
                    output.write(f"[ОШИБКА ЧТЕНИЯ {rel_path}: {e}]\n")


if __name__ == '__main__':
    print(f"Собираю код и структуру проекта в {OUTPUT_FILE}...")
    collect_files()
    print(f"Готово! Файл сохранён в {OUTPUT_FILE}")
