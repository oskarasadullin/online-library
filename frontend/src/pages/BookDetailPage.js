import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiBook, FiDownload, FiHeart, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer'; // ✅ НОВОЕ
import ReportModal from '../components/ReportModal'; // ✅ НОВОЕ
import { booksAPI, reviewsAPI, ratingsAPI, favoritesAPI, readStatusAPI } from '../services/api';
import '../styles/BookDetailPage.css';

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { showSuccess, showError, showWarning } = useToast(); // ✅ НОВОЕ

    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reportingReview, setReportingReview] = useState(null); // ✅ НОВОЕ

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
            showError('Не удалось загрузить данные книги');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!isAuthenticated) {
            showWarning('Войдите, чтобы скачать книгу');
            navigate('/auth');
            return;
        }

        try {
            const response = await booksAPI.download(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', book.filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showSuccess('Книга успешно скачана!');
        } catch (error) {
            console.error('Error downloading book:', error);
            if (error.response?.status === 429) {
                showWarning(error.response.data?.detail || 'Подождите 30 секунд перед следующей загрузкой');
            } else if (error.response?.status === 401) {
                showWarning('Необходимо войти в систему для скачивания');
                navigate('/auth');
            } else {
                showError('Не удалось скачать книгу');
            }
        }
    };

    const handleRating = async (value) => {
        if (!isAuthenticated) {
            showWarning('Войдите, чтобы поставить оценку');
            navigate('/auth');
            return;
        }

        try {
            await ratingsAPI.create({ book_id: parseInt(id), value });
            setUserRating(value);
            loadBookData();
            showSuccess(`Вы поставили оценку ${value} ★`);
        } catch (error) {
            console.error('Error rating book:', error);
            if (error.response?.status === 429) {
                showWarning(error.response.data?.detail || 'Подождите минуту перед следующей оценкой');
            } else {
                showError('Не удалось поставить оценку');
            }
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            showWarning('Войдите, чтобы оставить отзыв');
            navigate('/auth');
            return;
        }

        if (!reviewText.trim()) {
            showWarning('Введите текст отзыва');
            return;
        }

        try {
            await reviewsAPI.create({ book_id: parseInt(id), text: reviewText });
            setReviewText('');
            loadBookData();
            showSuccess('Отзыв успешно добавлен!');
        } catch (error) {
            console.error('Error submitting review:', error);
            if (error.response?.status === 429) {
                showWarning(error.response.data?.detail || 'Подождите минуту перед следующим отзывом');
            } else {
                showError('Не удалось отправить отзыв');
            }
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            showWarning('Войдите, чтобы добавить в избранное');
            navigate('/auth');
            return;
        }

        try {
            if (book.is_favorite) {
                await favoritesAPI.remove(id);
                showSuccess('Удалено из избранного');
            } else {
                await favoritesAPI.add(id);
                showSuccess('Добавлено в избранное ❤️');
            }
            loadBookData();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            if (error.response?.status === 429) {
                showWarning(error.response.data?.detail || 'Слишком частые действия');
            } else {
                showError('Не удалось обновить избранное');
            }
        }
    };

    const handleToggleRead = async () => {
        if (!isAuthenticated) {
            showWarning('Войдите, чтобы отметить как прочитанное');
            navigate('/auth');
            return;
        }

        try {
            if (book.is_read) {
                await readStatusAPI.markAsUnread(id);
                showSuccess('Отмечено как непрочитанное');
            } else {
                await readStatusAPI.markAsRead(id);
                showSuccess('Отмечено как прочитанное ✓');
            }
            loadBookData();
        } catch (error) {
            console.error('Error toggling read:', error);
            if (error.response?.status === 429) {
                showWarning(error.response.data?.detail || 'Слишком частые действия');
            } else {
                showError('Не удалось обновить статус');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка книги...</p>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="error-container">
                <h2>Книга не найдена</h2>
                <button onClick={() => navigate('/books')}>Вернуться к каталогу</button>
            </div>
        );
    }

    return (
        <div className="book-detail-page">
            <div className="book-detail-container">
                <div className="book-detail-header">
                    <div className="book-detail-cover">
                        <div className="book-detail-cover-placeholder">
                            {book.title.charAt(0)}
                        </div>
                    </div>

                    <div className="book-detail-info">
                        <h1 className="book-detail-title">{book.title}</h1>
                        <p className="book-detail-author">{book.author}</p>

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

                        {/* ✅ РЕЙТИНГ С УЛУЧШЕННЫМ UI */}
                        <div className="book-rating-section">
                            <div className="average-rating">
                                <span className="rating-label">Средний рейтинг:</span>
                                <span className="rating-value">
                                    {book.average_rating ? (
                                        <>★ {book.average_rating.toFixed(1)}</>
                                    ) : (
                                        'Нет оценок'
                                    )}
                                </span>
                            </div>

                            {isAuthenticated && (
                                <div className="user-rating">
                                    <p className="user-rating-label">Ваша оценка:</p>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                className={`star ${userRating >= star ? 'active' : ''}`}
                                                onClick={() => handleRating(star)}
                                                aria-label={`Оценить на ${star}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ✅ НОВЫЕ КНОПКИ С ИКОНКАМИ */}
                        <div className="book-actions">
                            <button
                                className="action-btn read-btn"
                                onClick={() => navigate(`/books/${id}/read`)}
                            >
                                <FiBook /> Читать онлайн
                            </button>

                            <button
                                className="action-btn download-btn"
                                onClick={handleDownload}
                            >
                                <FiDownload /> Скачать PDF
                            </button>

                            {isAuthenticated && (
                                <>
                                    <button
                                        className={`action-btn favorite-btn ${book.is_favorite ? 'active' : ''}`}
                                        onClick={handleToggleFavorite}
                                    >
                                        <FiHeart /> {book.is_favorite ? 'В избранном' : 'В избранное'}
                                    </button>

                                    <button
                                        className={`action-btn read-status-btn ${book.is_read ? 'active' : ''}`}
                                        onClick={handleToggleRead}
                                    >
                                        <FiCheckCircle /> {book.is_read ? 'Прочитано' : 'Прочитать'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ✅ СЕКЦИЯ ОТЗЫВОВ С ЖАЛОБАМИ */}
                <div className="reviews-section">
                    <h2>Отзывы ({reviews.length})</h2>

                    {isAuthenticated && (
                        <form className="review-form" onSubmit={handleReviewSubmit}>
                            <textarea
                                className="review-textarea"
                                placeholder="Поделитесь своим мнением о книге..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={4}
                                required
                            />
                            <button type="submit" className="btn-submit">
                                Отправить отзыв
                            </button>
                        </form>
                    )}

                    <div className="reviews-list">
                        {reviews.length === 0 ? (
                            <div className="no-reviews">
                                <p>Будьте первым, кто оставит отзыв!</p>
                            </div>
                        ) : (
                            reviews.map(review => (
                                <div key={review.id} className="review-item">
                                    <div className="review-header">
                                        <div className="review-author-info">
                                            <span className="review-author">{review.user_name}</span>
                                            <span className="review-date">
                                                {new Date(review.created_at).toLocaleDateString('ru-RU', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {/* ✅ КНОПКА ЖАЛОБЫ (только не на свой отзыв) */}
                                        {user && review.user_id !== user.id && (
                                            <button
                                                className="report-review-btn"
                                                onClick={() => setReportingReview(review)}
                                                title="Пожаловаться на отзыв"
                                            >
                                                <FiAlertTriangle />
                                            </button>
                                        )}
                                    </div>

                                    <p className="review-text">{review.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ МОДАЛ ЖАЛОБЫ */}
            {reportingReview && (
                <ReportModal
                    review={reportingReview}
                    onClose={() => setReportingReview(null)}
                    onSuccess={() => {
                        setReportingReview(null);
                        showSuccess('Жалоба отправлена на модерацию');
                    }}
                />
            )}
        </div>
    );
};

export default BookDetailPage;
