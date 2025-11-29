import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Navigation.css';

const Navigation = () => {
    const { isAuthenticated, isAdmin, logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <nav className="navigation">
            <div className="nav-container">
                {/* Logo */}
                <Link to="/" className="nav-logo">
                    <div className="logo-icon">📚</div>
                    <span className="logo-text">Библиотека Пионеров</span>
                </Link>

                {/* Desktop Nav Links */}
                <ul className="nav-links">
                    <li>
                        <Link
                            to="/"
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Главная
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/books"
                            className={`nav-link ${isActive('/books') ? 'active' : ''}`}
                        >
                            Книги
                        </Link>
                    </li>
                    {isAuthenticated && (
                        <>
                            <li>
                                <Link
                                    to="/sections/methodclub"
                                    className={`nav-link ${isActive('/sections') ? 'active' : ''}`}
                                >
                                    Разделы
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/favorites"
                                    className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
                                >
                                    Избранное
                                </Link>
                            </li>
                        </>
                    )}
                    {isAdmin && (
                        <li>
                            <Link
                                to="/admin"
                                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                            >
                                Админ
                            </Link>
                        </li>
                    )}
                </ul>


                {/* Nav Actions */}
                <div className="nav-actions">
                    {/* Theme Toggle */}
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        )}
                    </button>

                    {/* User Info or Login */}
                    {isAuthenticated ? (
                        <>
                            <div className="user-info">
                                <div className="user-avatar">
                                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="user-name">{user?.full_name}</span>
                            </div>
                            <button className="btn-logout" onClick={handleLogout}>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <Link to="/auth" className="btn-login">
                            Войти
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="mobile-menu-bar"></span>
                        <span className="mobile-menu-bar"></span>
                        <span className="mobile-menu-bar"></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-content">
                    <Link
                        to="/"
                        className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        Главная
                    </Link>
                    <Link
                        to="/books"
                        className={`mobile-nav-link ${isActive('/books') ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        Книги
                    </Link>
                    {isAuthenticated && (
                        <Link
                            to="/favorites"
                            className={`mobile-nav-link ${isActive('/favorites') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            Избранное
                        </Link>
                    )}
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            Админ
                        </Link>
                    )}

                    <div className="mobile-divider"></div>

                    <div className="mobile-actions">
                        <button className="mobile-theme-toggle" onClick={toggleTheme}>
                            {theme === 'light' ? '🌙 Темная тема' : '☀️ Светлая тема'}
                        </button>

                        {isAuthenticated ? (
                            <button className="btn-logout" onClick={handleLogout} style={{ width: '100%' }}>
                                Выйти
                            </button>
                        ) : (
                            <Link to="/auth" className="btn-login" onClick={closeMobileMenu} style={{ width: '100%' }}>
                                Войти
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
