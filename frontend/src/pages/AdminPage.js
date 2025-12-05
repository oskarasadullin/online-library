import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Iridescence from '../components/Iridescence';
import { booksAPI } from '../services/api';
import { FaShieldAlt } from 'react-icons/fa';
import { FiAlertTriangle, FiUpload, FiRefreshCw } from 'react-icons/fi'; // ✅ НОВОЕ
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
    const [reportsStats, setReportsStats] = useState({ pending: 0, resolved: 0, total: 0 }); // ✅ НОВОЕ

    // Refs
    const uploadCardRef = useRef(null);
    const syncCardRef = useRef(null);
    const moderationCardRef = useRef(null); // ✅ НОВОЕ

    // Redirect если не админ
    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // ✅ НОВОЕ: Загрузка статистики модерации
    useEffect(() => {
        if (isAdmin) {
            loadReportsStats();
        }
    }, [isAdmin]);

    const loadReportsStats = async () => {
        try {
            const stats = await booksAPI.getReportsStats();
            setReportsStats(stats);
        } catch (error) {
            console.error('Failed to load reports stats:', error);
        }
    };

    // Intersection Observer
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

        [uploadCardRef, syncCardRef, moderationCardRef].forEach(ref => { // ✅ ДОБАВЛЕНО moderationCardRef
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => observer.disconnect();
    }, []);

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        const fileInput = document.getElementById('file');
        if (fileInput) fileInput.value = '';
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            showMessage('Пожалуйста, выберите PDF файл', 'error');
            return;
        }

        if (!formData.tag.trim() || !formData.genre.trim() || !formData.title.trim() ||
            !formData.author.trim() || !formData.description.trim()) {
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

            await booksAPI.create(data);
            showMessage('Книга успешно добавлена!', 'success');
            resetForm();
        } catch (error) {
            let errorMsg = 'Ошибка при добавлении книги';
            if (error.response) {
                errorMsg = error.response.data?.detail ||
                    error.response.data?.message ||
                    `Ошибка ${error.response.status}`;
            }
            showMessage(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

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
        <div className="admin-page">
            {/* Hero Section */}
            <div className="admin-hero">
                <Iridescence color={[0.5, 0.6, 0.8]} mouseReact={false} amplitude={0.1} speed={1} />
                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Панель<br />
                            управления
                        </h1>
                        <p className="hero-subtitle">
                            Администрирование библиотеки книг<br />
                            и управление контентом
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration">
                            <FaShieldAlt className="main-icon" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Content Section */}
            <div className="admin-content-section">
                <div className="admin-container">
                    {/* Message */}
                    {message.text && (
                        <div className={`admin-message admin-message-${message.type}`}>
                            <span className="message-icon">{message.type === 'success' ? '✓' : '✕'}</span>
                            <span className="message-text">{message.text}</span>
                        </div>
                    )}

                    {/* ✅ НОВОЕ: Quick Actions Grid */}
                    <div className="admin-quick-actions">
                        <div
                            className="quick-action-card upload-card"
                            onClick={() => uploadCardRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <div className="quick-action-icon upload">
                                <FiUpload />
                            </div>
                            <div className="quick-action-content">
                                <h3>Добавить книгу</h3>
                                <p>Загрузить новую книгу в библиотеку</p>
                            </div>
                        </div>

                        <div
                            className="quick-action-card moderation-card"
                            onClick={() => navigate('/admin/moderation')}
                        >
                            <div className="quick-action-icon moderation">
                                <FiAlertTriangle />
                            </div>
                            <div className="quick-action-content">
                                <h3>Модерация отзывов</h3>
                                <p>Обработка жалоб пользователей</p>
                            </div>
                            {reportsStats.pending > 0 && (
                                <div className="quick-action-badge">{reportsStats.pending}</div>
                            )}
                        </div>

                        <div
                            className="quick-action-card sync-card"
                            onClick={() => syncCardRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <div className="quick-action-icon sync">
                                <FiRefreshCw />
                            </div>
                            <div className="quick-action-content">
                                <h3>Синхронизация</h3>
                                <p>Обновить данные из файловой системы</p>
                            </div>
                        </div>
                    </div>

                    {/* Upload Card */}
                    <div ref={uploadCardRef} className="admin-card">
                        <div className="card-header">
                            <h2 className="card-title">Добавить книгу</h2>
                            <p className="card-description">Заполните все поля и загрузите PDF файл</p>
                        </div>

                        <form className="admin-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label" htmlFor="tag">
                                        Тег <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="tag"
                                        name="tag"
                                        className="form-input"
                                        value={formData.tag}
                                        onChange={handleInputChange}
                                        placeholder="Например: Методика"
                                    />
                                </div>

                                <div className="form-field">
                                    <label className="form-label" htmlFor="genre">
                                        Жанр <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="genre"
                                        name="genre"
                                        className="form-input"
                                        value={formData.genre}
                                        onChange={handleInputChange}
                                        placeholder="Например: Педагогика"
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="title">
                                    Название <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Полное название книги"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="author">
                                    Автор <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    className="form-input"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    placeholder="Имя автора"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="description">
                                    Описание <span className="required">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Краткое описание книги"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="file">
                                    PDF файл <span className="required">*</span>
                                </label>
                                <div className="file-input-wrapper">
                                    <input
                                        type="file"
                                        id="file"
                                        className="file-input"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="file" className="file-input-label">
                                        <span className="file-input-icon">📁</span>
                                        <span className="file-input-text">
                                            {fileName || 'Выберите PDF файл'}
                                        </span>
                                        <span className="file-input-button">Обзор</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        <span>Загрузка...</span>
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

                    {/* Sync Card */}
                    <div ref={syncCardRef} className="admin-card">
                        <div className="card-header">
                            <h2 className="card-title">Синхронизация</h2>
                            <p className="card-description">Обновить данные из файловой системы</p>
                        </div>

                        <div className="sync-content">
                            <div className="sync-info">
                                <span className="sync-icon">ℹ️</span>
                                <p className="sync-text">
                                    Синхронизация проверит все файлы и обновит информацию в базе данных.
                                    Это может занять некоторое время.
                                </p>
                            </div>

                            <button
                                type="button"
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
        </div>
    );
};

export default AdminPage;
