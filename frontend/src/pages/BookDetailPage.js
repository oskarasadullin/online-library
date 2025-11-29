import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI, reviewsAPI, ratingsAPI, favoritesAPI, readStatusAPI } from '../services/api';
import '../styles/BookDetailPage.css';


const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showPDF, setShowPDF] = useState(false);
    const [error, setError] = useState(''); // Добавлено для отображения ошибок

    useEffect(() => {
        loadBookData();
    }, [id]);

    const loadBookData = async () => {
        try {
            const [bookRes, reviewsRes] = await Promise.all([
                booksAPI.getById(id),
                reviewsAPI.getByBook(id)
            ]);
            setBook(bookRes.data);
            setReviews(reviewsRes.data);
            setUserRating(bookRes.data.user_rating || 0);
        } catch (error) {
            console.error('Error loading book:', error);
        } finally {
            setLoading(false);
        }
    };

    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000); // Скрыть через 5 секунд
    };

    const handleDownload = async () => {
        try {
            const response = await booksAPI.download(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', book.filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading book:', error);
            if (error.response?.status === 429) {
                showError(error.response.data?.detail || 'Вы можете скачивать файлы не чаще 1 раза в 30 секунд. Подождите.');
            } else if (error.response?.status === 401) {
                showError('Необходимо войти в систему для скачивания');
                navigate('/auth');
            } else {
                showError('Ошибка при скачивании книги');
            }
        }
    };

    const handleRating = async (value) => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        try {
            await ratingsAPI.create({ book_id: parseInt(id), value });
            setUserRating(value);
            loadBookData();
        } catch (error) {
            console.error('Error rating book:', error);
            if (error.response?.status === 429) {
                showError(error.response.data?.detail || 'Вы можете ставить оценки не чаще 1 раза в минуту. Подождите.');
            } else {
                showError('Ошибка при выставлении оценки');
            }
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        try {
            await reviewsAPI.create({ book_id: parseInt(id), text: reviewText });
            setReviewText('');
            loadBookData();
            showError('Отзыв успешно добавлен!'); // Используем для успеха тоже
        } catch (error) {
            console.error('Error submitting review:', error);
            if (error.response?.status === 429) {
                showError(error.response.data?.detail || 'Вы можете оставлять не более 1 отзыва в минуту. Подождите.');
            } else {
                showError('Ошибка при отправке отзыва');
            }
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        try {
            if (book.is_favorite) {
                await favoritesAPI.remove(id);
            } else {
                await favoritesAPI.add(id);
            }
            loadBookData();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            if (error.response?.status === 429) {
                showError(error.response.data?.detail || 'Слишком частые действия. Подождите.');
            } else {
                showError('Ошибка при обновлении избранного');
            }
        }
    };

    const handleToggleRead = async () => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        try {
            if (book.is_read) {
                await readStatusAPI.markAsUnread(id);
            } else {
                await readStatusAPI.markAsRead(id);
            }
            loadBookData();
        } catch (error) {
            console.error('Error toggling read:', error);
            if (error.response?.status === 429) {
                showError(error.response.data?.detail || 'Слишком частые действия. Подождите.');
            } else {
                showError('Ошибка при обновлении статуса прочтения');
            }
        }
    };

    const handleViewPDF = async () => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        try {
            setShowPDF(!showPDF);
        } catch (error) {
            console.error('Error viewing PDF:', error);
            if (error.response?.status === 429) {
                showError(error.response.data?.detail || 'Вы можете открывать книги не чаще 1 раза в 30 секунд. Подождите.');
            } else {
                showError('Ошибка при открытии книги');
            }
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (!book) return <div className="error">Книга не найдена</div>;

    return (
        <div className="book-detail-page">
            <div className="book-detail-container">
                {/* Уведомление об ошибках */}
                {error && (
                    <div className="notification-message">
                        {error}
                    </div>
                )}

                <div className="book-main-info">
                    <h1 className="book-detail-title">{book.title}</h1>
                    <p className="book-detail-author">Автор: {book.author}</p>

                    <div className="book-detail-tags">
                        <span className="detail-tag tag-genre">{book.genre}</span>
                        <span className="detail-tag tag-category">{book.tag}</span>
                    </div>

                    {book.description && (
                        <div className="book-description">
                            <h3>Описание</h3>
                            <p>{book.description}</p>
                        </div>
                    )}

                    <div className="book-rating-section">
                        <div className="average-rating">
                            <span className="rating-label">Средний рейтинг:</span>
                            <span className="rating-value">
                                {book.average_rating ? `★ ${book.average_rating.toFixed(1)}` : 'Нет оценок'}
                            </span>
                        </div>

                        {isAuthenticated && (
                            <div className="user-rating">
                                <span className="rating-label">Ваша оценка:</span>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            className={`star ${userRating >= star ? 'active' : ''}`}
                                            onClick={() => handleRating(star)}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="book-actions">
                        <button className="btn-action btn-read" onClick={handleViewPDF}>
                            {showPDF ? 'Скрыть книгу' : 'Читать онлайн'}
                        </button>
                        <button className="btn-action btn-download" onClick={handleDownload}>
                            Скачать
                        </button>
                        {isAuthenticated && (
                            <>
                                <button
                                    className={`btn-action ${book.is_favorite ? 'active' : ''}`}
                                    onClick={handleToggleFavorite}
                                >
                                    {book.is_favorite ? 'В избранном' : 'Добавить в избранное'}
                                </button>
                                <button
                                    className={`btn-action ${book.is_read ? 'active' : ''}`}
                                    onClick={handleToggleRead}
                                >
                                    {book.is_read ? 'Прочитано' : 'Отметить как прочитанное'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {showPDF && (
                    <div className="pdf-viewer">
                        <iframe
                            src={booksAPI.view(id)}
                            title={book.title}
                            width="100%"
                            height="800px"
                        />
                    </div>
                )}

                <div className="reviews-section">
                    <h2>Отзывы</h2>

                    {isAuthenticated && (
                        <form className="review-form" onSubmit={handleReviewSubmit}>
                            <textarea
                                className="review-textarea"
                                placeholder="Напишите ваш отзыв..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-submit">
                                Отправить отзыв
                            </button>
                        </form>
                    )}

                    <div className="reviews-list">
                        {reviews.length === 0 ? (
                            <p className="no-reviews">Пока нет отзывов</p>
                        ) : (
                            reviews.map(review => (
                                <div key={review.id} className="review-item">
                                    <div className="review-header">
                                        <span className="review-author">{review.user_name}</span>
                                        <span className="review-date">
                                            {new Date(review.created_at).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>

                                    <p className="review-text">{review.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;
