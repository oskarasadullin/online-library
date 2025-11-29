import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import SectionsPage from './pages/SectionsPage';
import MethodClubPage from './pages/sections/MethodClubPage';
import PioneersWorkPage from './pages/sections/PioneersWorkPage';
import SchoolLeadersPage from './pages/sections/SchoolLeadersPage';
import VolunteersPage from './pages/sections/VolunteersPage';
import SchoolMediaPage from './pages/sections/SchoolMediaPage';
import GamesPage from './pages/sections/GamesPage'; // ✅ ДОБАВЛЕНО
import ScenariosPage from './pages/sections/ScenariosPage'; // ✅ ДОБАВЛЕНО
import PioneerBookPage from './pages/sections/PioneerBookPage'; // ✅ ДОБАВЛЕНО
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
                        <Navigation />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/books" element={<BooksPage />} />
                                <Route path="/books/:id" element={<BookDetailPage />} />
                                <Route path="/favorites" element={<FavoritesPage />} />
                                <Route path="/auth" element={<AuthPage />} />
                                <Route path="/admin" element={<AdminPage />} />

                                {/* Разделы */}
                                <Route path="/sections/*" element={
                                    <SectionsPage>
                                        <Routes>
                                            <Route path="methodclub" element={<MethodClubPage />} />
                                            <Route path="pioneers" element={<PioneersWorkPage />} />
                                            <Route path="leaders" element={<SchoolLeadersPage />} />
                                            <Route path="volunteers" element={<VolunteersPage />} />
                                            <Route path="media" element={<SchoolMediaPage />} />
                                            <Route path="games" element={<GamesPage />} /> {/* ✅ ДОБАВЛЕНО */}
                                            <Route path="scenarios" element={<ScenariosPage />} /> {/* ✅ ДОБАВЛЕНО */}
                                            <Route path="book" element={<PioneerBookPage />} /> {/* ✅ ДОБАВЛЕНО */}
                                            <Route path="exchange" element={<ExchangePage />} />
                                            <Route path="contacts" element={<ContactsPage />} />
                                            <Route path="calendar" element={<CalendarPage />} />
                                            <Route path="documents" element={<DocumentsPage />} />
                                        </Routes>
                                    </SectionsPage>
                                } />

                            </Routes>
                        </main>
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}


export default App;
