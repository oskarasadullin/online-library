import React, { useState, useEffect, useRef } from 'react';
import BookCard from '../components/BookCard';
import SearchFilters from '../components/SearchFilters';
import { booksAPI } from '../services/api';
import '../styles/BooksPage.css';

const BooksPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const bookCardsRef = useRef([]);

    useEffect(() => {
        loadBooks();
    }, [filters]);

    // Intersection Observer для появления карточек
    useEffect(() => {
        if (books.length === 0) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        bookCardsRef.current.forEach(card => {
            if (card) observer.observe(card);
        });

        return () => observer.disconnect();
    }, [books]);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const response = await booksAPI.getAll(filters);
            setBooks(response.data);
        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="books-page">
            <div className="books-container">
                {/* Premium Header */}
                <header className="page-header">
                    <h1>Библиотека</h1>
                    <p className="page-subtitle">
                        Откройте для себя тысячи удивительных книг
                    </p>
                </header>

                {/* Premium Search & Filters */}
                <div className="books-controls">
                    <SearchFilters
                        filters={filters}
                        onFilterChange={setFilters}
                    />
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="books-loading">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Загружаем книги...</p>
                    </div>
                )}

                {/* Books Grid - БЕЗ results-info */}
                {!loading && books.length > 0 && (
                    <div className="books-grid">
                        {books.map((book, index) => (
                            <div
                                key={book.id}
                                className="book-card-wrapper"
                                ref={el => bookCardsRef.current[index] = el}
                            >
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Premium Empty State */}
                {!loading && books.length === 0 && (
                    <div className="books-empty">
                        <div className="books-empty-icon">📚</div>
                        <h2 className="books-empty-title">Книги не найдены</h2>
                        <p className="books-empty-text">
                            Попробуйте изменить параметры поиска или очистить фильтры
                        </p>
                        <button
                            className="books-empty-button"
                            onClick={() => setFilters({})}
                        >
                            Сбросить все фильтры
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BooksPage;
