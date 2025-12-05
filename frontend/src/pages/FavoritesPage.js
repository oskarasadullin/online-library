import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Iridescence from '../components/Iridescence';
import BookCard from '../components/BookCard';
import { favoritesAPI } from '../services/api';
import { FaHeart, FaHeartBroken } from 'react-icons/fa';
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
            {/* Hero Section */}
            <div className="favorites-hero">
                <Iridescence color={[0.5, 0.6, 0.8]} mouseReact={false} amplitude={0.1} speed={1} />
                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Избранные<br />
                            книги
                        </h1>
                        <p className="hero-subtitle">
                            Ваша личная коллекция избранных материалов<br />
                            для быстрого доступа
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration">
                            <div className="heart-icon-wrapper">
                                <FaHeart className="main-heart-icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Favorites Content Section */}
            <div className="favorites-content-section">
                {loading ? (
                    <div className="favorites-loading">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Загружаем избранные книги...</p>
                    </div>
                ) : books.length > 0 ? (
                    <div className="favorites-grid">
                        {books.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="favorites-empty">
                        <FaHeartBroken className="favorites-empty-icon" />
                        <h2 className="favorites-empty-title">Здесь пока пусто</h2>
                        <p className="favorites-empty-text">
                            Вы еще не добавили книги в избранное.<br />
                            Начните с изучения каталога!
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
