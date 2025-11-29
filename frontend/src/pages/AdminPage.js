import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import '../styles/AdminPage.css';

const AdminPage = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        tag: '',
        genre: '',
        title: '',
        author: '',
        description: ''
    });
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Refs для анимаций
    const pageRef = useRef(null);
    const titleRef = useRef(null);
    const uploadCardRef = useRef(null);
    const syncCardRef = useRef(null);

    // Redirect если не админ
    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // Intersection Observer для плавных анимаций
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Наблюдаем за элементами
        [titleRef, uploadCardRef, syncCardRef].forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => observer.disconnect();
    }, []);

    // Обработчики формы
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        }
    };

    const resetForm = () => {
        setFormData({
            tag: '',
            genre: '',
            title: '',
            author: '',
            description: ''
        });
        setFile(null);
        setFileName('');

        // Очистка file input
        const fileInput = document.getElementById('file');
        if (fileInput) fileInput.value = '';
    };


    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 5000);
    };

    // Добавление книги
    // Добавление книги
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверка файла
        if (!file) {
            showMessage('Пожалуйста, выберите PDF файл', 'error');
            return;
        }

        // Проверка обязательных полей
        if (!formData.tag.trim() || !formData.genre.trim() ||
            !formData.title.trim() || !formData.author.trim() ||
            !formData.description.trim()) {
            showMessage('Заполните все обязательные поля', 'error');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('file', file);
            data.append('tag', formData.tag.trim());
            data.append('genre', formData.genre.trim());
            data.append('title', formData.title.trim());
            data.append('author', formData.author.trim());
            data.append('description', formData.description.trim());

            // Отладочный лог
            console.log('Отправляемые данные:');
            for (let [key, value] of data.entries()) {
                console.log(key, ':', value);
            }

            const response = await booksAPI.create(data);
            console.log('Ответ сервера:', response);

            showMessage('Книга успешно добавлена!', 'success');
            resetForm();

            // Очистка file input
            const fileInput = document.getElementById('file');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Полная ошибка:', error);
            console.error('Ответ сервера:', error.response);

            let errorMsg = 'Ошибка при добавлении книги';

            if (error.response) {
                // Сервер ответил с ошибкой
                errorMsg = error.response.data?.detail ||
                    error.response.data?.message ||
                    `Ошибка ${error.response.status}`;

                // Если есть детальная информация об ошибках полей
                if (error.response.data?.errors) {
                    console.error('Ошибки полей:', error.response.data.errors);
                }
            } else if (error.request) {
                // Запрос был отправлен, но ответа нет
                errorMsg = 'Нет ответа от сервера';
            } else {
                // Ошибка при настройке запроса
                errorMsg = error.message;
            }

            showMessage(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };


    // Синхронизация
    const handleSync = async () => {
        setLoading(true);

        try {
            const response = await booksAPI.sync();
            showMessage(response.data.message || 'Синхронизация завершена', 'success');
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'Ошибка при синхронизации';
            showMessage(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="admin-page" ref={pageRef}>
            <div className="admin-container">

                {/* Заголовок */}
                <div className="admin-header" ref={titleRef}>
                    <h1 className="admin-title">Панель администратора</h1>
                    <p className="admin-subtitle">Управление библиотекой книг</p>
                </div>

                {/* Сообщения */}
                {message.text && (
                    <div className={`admin-message admin-message-${message.type}`}>
                        <span className="message-icon">
                            {message.type === 'success' ? '' : '⚠'}
                        </span>
                        <span className="message-text">{message.text}</span>
                    </div>
                )}

                {/* Секция добавления книги */}
                <div className="admin-card" ref={uploadCardRef}>
                    <div className="card-header">
                        <h2 className="card-title">Добавить новую книгу</h2>
                        <p className="card-description">Заполните все поля и загрузите PDF файл</p>
                    </div>

                    <form className="admin-form" onSubmit={handleSubmit}>
                        {/* Тег и Жанр */}
                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="tag" className="form-label">
                                    Тег <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="tag"
                                    name="tag"
                                    className="form-input"
                                    value={formData.tag}
                                    onChange={handleInputChange}
                                    placeholder="Например: Художественная литература"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="genre" className="form-label">
                                    Жанр <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="genre"
                                    name="genre"
                                    className="form-input"
                                    value={formData.genre}
                                    onChange={handleInputChange}
                                    placeholder="Например: Фантастика"
                                    required
                                />
                            </div>
                        </div>

                        {/* Название */}
                        <div className="form-field">
                            <label htmlFor="title" className="form-label">
                                Название книги <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Введите полное название книги"
                                required
                            />
                        </div>

                        {/* Автор */}
                        <div className="form-field">
                            <label htmlFor="author" className="form-label">
                                Автор <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="author"
                                name="author"
                                className="form-input"
                                value={formData.author}
                                onChange={handleInputChange}
                                placeholder="Имя и фамилия автора"
                                required
                            />
                        </div>

                        {/* Описание */}
                        <div className="form-field">
                            <label htmlFor="description" className="form-label">
                                Описание <span className="required">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Краткое описание книги, её содержания и особенностей"
                                rows="5"
                                required
                            />
                        </div>

                        {/* Файл */}
                        <div className="form-field">
                            <label htmlFor="file" className="form-label">
                                PDF файл <span className="required">*</span>
                            </label>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="file"
                                    className="file-input"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    required
                                />
                                <label htmlFor="file" className="file-input-label">
                                    <span className="file-input-icon">📄</span>
                                    <span className="file-input-text">
                                        {fileName || 'Выберите PDF файл'}
                                    </span>
                                    <span className="file-input-button">Обзор</span>
                                </label>
                            </div>
                        </div>

                        {/* Кнопка отправки */}
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    <span>Добавление...</span>
                                </>
                            ) : (
                                <>
                                    <span>Добавить книгу</span>
                                    <span className="btn-arrow">→</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Секция синхронизации */}
                <div className="admin-card" ref={syncCardRef}>
                    <div className="card-header">
                        <h2 className="card-title">Синхронизация базы данных</h2>
                        <p className="card-description">
                            Обновить данные из файловой системы
                        </p>
                    </div>

                    <div className="sync-content">
                        <div className="sync-info">
                            <div className="sync-icon">🔄</div>
                            <p className="sync-text">
                                Синхронизация проверит все файлы и обновит информацию в базе данных.
                                Это может занять некоторое время.
                            </p>
                        </div>

                        <button
                            className="btn-secondary"
                            onClick={handleSync}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    <span>Синхронизация...</span>
                                </>
                            ) : (
                                <>
                                    <span>Запустить синхронизацию</span>
                                    <span className="btn-arrow">→</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminPage;
