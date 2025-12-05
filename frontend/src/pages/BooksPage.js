import React, { useState, useEffect, useRef } from 'react';
import Iridescence from '../components/Iridescence';
import BookCard from '../components/BookCard';
import SearchFilters from '../components/SearchFilters';
import { booksAPI } from '../services/api';
import { HiBookOpen } from 'react-icons/hi';
import '../styles/BooksPage.css';

const BooksPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const bookCardsRef = useRef([]);

    useEffect(() => {
        loadBooks();
    }, [filters]);

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
            {/* Hero Section */}
            <div className="books-hero">
                <Iridescence color={[0.5, 0.6, 0.8]} mouseReact={false} amplitude={0.1} speed={1} />
                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Библиотека<br />
                            Пионеров
                        </h1>
                        <p className="hero-subtitle">
                            Более 1000 книг для вожатых, педагогов<br />
                            и активистов детского движения
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-books">
                            <div className="book-icon-wrapper">
                                <HiBookOpen className="main-book-icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Books Content Section */}
            <div className="books-content-section">
                <div className="books-controls">
                    <SearchFilters onFilterChange={setFilters} />
                </div>

                {loading ? (
                    <div className="books-loading">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Загружаем книги...</p>
                    </div>
                ) : books.length > 0 ? (
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
                ) : (
                    <div className="books-empty">
                        <div className="books-empty-icon">📚</div>
                        <h2 className="books-empty-title">Книги не найдены</h2>
                        <p className="books-empty-text">
                            Попробуйте изменить параметры поиска или очистить фильтры
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BooksPage;
