import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/BookCard.css';

const BookCard = ({ book }) => {
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i}>{i < Math.floor(rating) ? '★' : '☆'}</span>
        ));
    };

    return (
        <Link to={`/books/${book.id}`} className="book-card">
            {/* Cover */}
            <div className="book-cover">
                {book.cover_image ? (
                    <img
                        src={book.cover_image}
                        alt={book.title}
                        className="book-cover-img"
                    />
                ) : (
                    <div className="book-cover-icon">📚</div>
                )}
            </div>

            {/* Body */}
            <div className="book-body">
                {/* Title */}
                <h3 className="book-title">{book.title}</h3>

                {/* Author */}
                {book.author && (
                    <div className="book-author">Автор: {book.author}</div>
                )}

                {/* Tags - жанр и категория */}
                {(book.genre || book.tag) && (
                    <div className="book-tags">
                        {book.genre && (
                            <span className="book-tag genre">{book.genre}</span>
                        )}
                        {book.tag && (
                            <span className="book-tag category">{book.tag}</span>
                        )}
                    </div>
                )}

                {/* Description */}
                {book.description && (
                    <p className="book-description">{book.description}</p>
                )}

                {/* Rating */}
                {book.rating && (
                    <div className="book-rating">
                        <div className="rating-stars">
                            {renderStars(book.rating)}
                        </div>
                        <span className="rating-value">{book.rating.toFixed(1)}</span>
                        {book.rating_count > 0 && (
                            <span className="rating-count">({book.rating_count})</span>
                        )}
                    </div>
                )}

                {/* Footer Info */}
                {(book.year || book.pages) && (
                    <div className="book-footer">
                        <div className="book-info">
                            {book.year && (
                                <span className="book-year">{book.year}</span>
                            )}
                            {book.pages && (
                                <span className="book-pages">{book.pages} стр.</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default BookCard;
