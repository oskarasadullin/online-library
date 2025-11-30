import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import StaggeredMenu from './components/StaggeredMenu';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import PrivacyPage from './pages/PrivacyPage';
// Разделы напрямую
import MethodClubPage from './pages/sections/MethodClubPage';
import PioneersWorkPage from './pages/sections/PioneersWorkPage';
import SchoolLeadersPage from './pages/sections/SchoolLeadersPage';
import VolunteersPage from './pages/sections/VolunteersPage';
import SchoolMediaPage from './pages/sections/SchoolMediaPage';
import GamesPage from './pages/sections/GamesPage';
import ScenariosPage from './pages/sections/ScenariosPage';
import PioneerBookPage from './pages/sections/PioneerBookPage';
import ExchangePage from './pages/sections/ExchangePage';
import ContactsPage from './pages/sections/ContactsPage';
import CalendarPage from './pages/sections/CalendarPage';
import DocumentsPage from './pages/sections/DocumentsPage';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="app">
                        {/* Анимированное меню с подкатегориями */}
                        <StaggeredMenu
                            position="right"
                            colors={['#667eea', '#764ba2']}
                            logoText="📚 Библиотека Пионеров"
                            accentColor="#667eea"  // ← Было #00e965, теперь фиолетовый
                            menuButtonColor="#1d1d1f"
                            openMenuButtonColor="#1d1d1f"
                            changeMenuColorOnOpen={false}
                            closeOnClickAway={true}
                        />


                        <main className="main-content">
                            <Routes>
                                {/* Основные страницы */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/books" element={<BooksPage />} />
                                <Route path="/books/:id" element={<BookDetailPage />} />
                                <Route path="/favorites" element={<FavoritesPage />} />
                                <Route path="/auth" element={<AuthPage />} />
                                <Route path="/admin" element={<AdminPage />} />
                                <Route path="/privacy" element={<PrivacyPage />} />

                                {/* Разделы - прямые роуты без обертки */}
                                <Route path="/sections/methodclub" element={<MethodClubPage />} />
                                <Route path="/sections/pioneers" element={<PioneersWorkPage />} />
                                <Route path="/sections/leaders" element={<SchoolLeadersPage />} />
                                <Route path="/sections/volunteers" element={<VolunteersPage />} />
                                <Route path="/sections/media" element={<SchoolMediaPage />} />
                                <Route path="/sections/games" element={<GamesPage />} />
                                <Route path="/sections/scenarios" element={<ScenariosPage />} />
                                <Route path="/sections/book" element={<PioneerBookPage />} />
                                <Route path="/sections/exchange" element={<ExchangePage />} />
                                <Route path="/sections/contacts" element={<ContactsPage />} />
                                <Route path="/sections/calendar" element={<CalendarPage />} />
                                <Route path="/sections/documents" element={<DocumentsPage />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
