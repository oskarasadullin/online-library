import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookCard from '../components/BookCard';
import { favoritesAPI } from '../services/api';
import '../styles/FavoritesPage.css';

const FavoritesPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadFavorites();
    }, [isAuthenticated, navigate]);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const response = await favoritesAPI.getAll();
            setBooks(response.data);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="favorites-page">
            <div className="favorites-container">
                {/* Header */}
                <header className="page-header">
                    <h1>Избранное</h1>
                    <p className="page-subtitle">
                        Ваша персональная коллекция любимых книг
                    </p>
                </header>

                {/* Loading State */}
                {loading && (
                    <div className="favorites-loading">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Загружаем избранные книги...</p>
                    </div>
                )}

                {/* Books Grid */}
                {!loading && books.length > 0 && (
                    <div className="favorites-grid">
                        {books.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onUpdate={loadFavorites}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && books.length === 0 && (
                    <div className="favorites-empty">
                        <div className="favorites-empty-icon">📚</div>
                        <h2 className="favorites-empty-title">Пока пусто</h2>
                        <p className="favorites-empty-text">
                            Вы еще не добавили книги в избранное. Начните с изучения каталога!
                        </p>
                        <Link to="/books" className="favorites-empty-button">
                            Перейти к книгам
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
