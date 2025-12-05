import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiX, FiBookmark, FiMaximize, FiMinimize, FiChevronLeft, FiChevronRight, FiEdit3, FiSave } from 'react-icons/fi';
import { booksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';
import '../styles/ReaderPage.css';

const ReaderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [bookmarks, setBookmarks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [showNoteEditor, setShowNoteEditor] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [editingNote, setEditingNote] = useState(null);

    const viewerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        loadBook();
        loadBookmarks();
        loadNotes();
    }, [id]);

    const loadBook = async () => {
        try {
            const data = await booksAPI.getBook(id);
            setBook(data);
        } catch (error) {
            showError('Не удалось загрузить книгу');
            navigate('/books');
        } finally {
            setLoading(false);
        }
    };

    const loadBookmarks = async () => {
        if (!user) return;
        try {
            const data = await booksAPI.getBookmarks(id);
            setBookmarks(data);
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
        }
    };

    const loadNotes = async () => {
        if (!user) return;
        try {
            const data = await booksAPI.getNotes(id);
            setNotes(data);
        } catch (error) {
            console.error('Failed to load notes:', error);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const addBookmark = async () => {
        if (!user) {
            showWarning('Войдите, чтобы добавить закладку');
            return;
        }

        try {
            await booksAPI.addBookmark(id, currentPage);
            setBookmarks([...bookmarks, { page: currentPage, created_at: new Date() }]);
            showSuccess(`Закладка добавлена на стр. ${currentPage}`);
        } catch (error) {
            showError('Не удалось добавить закладку');
        }
    };

    const removeBookmark = async (page) => {
        try {
            await booksAPI.removeBookmark(id, page);
            setBookmarks(bookmarks.filter(b => b.page !== page));
            showSuccess('Закладка удалена');
        } catch (error) {
            showError('Не удалось удалить закладку');
        }
    };

    const saveNote = async () => {
        if (!user) {
            showWarning('Войдите, чтобы сохранить заметку');
            return;
        }

        if (!noteText.trim()) {
            showWarning('Введите текст заметки');
            return;
        }

        try {
            if (editingNote) {
                await booksAPI.updateNote(editingNote.id, noteText);
                setNotes(notes.map(n => n.id === editingNote.id ? { ...n, text: noteText } : n));
                showSuccess('Заметка обновлена');
            } else {
                const newNote = await booksAPI.createNote(id, currentPage, noteText);
                setNotes([...notes, newNote]);
                showSuccess('Заметка сохранена');
            }
            setNoteText('');
            setEditingNote(null);
            setShowNoteEditor(false);
        } catch (error) {
            showError('Не удалось сохранить заметку');
        }
    };

    const isBookmarked = bookmarks.some(b => b.page === currentPage);

    if (loading) {
        return (
            <div className="reader-loading">
                <div className="spinner"></div>
                <p>Загрузка книги...</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`reader-container ${isFullscreen ? 'fullscreen' : ''}`}>
            {/* Header */}
            <div className="reader-header">
                <button className="reader-close" onClick={() => navigate(`/books/${id}`)} aria-label="Закрыть">
                    <FiX />
                </button>
                <h1 className="reader-title">{book?.title}</h1>
                <div className="reader-controls">
                    <button
                        className={`reader-btn ${isBookmarked ? 'active' : ''}`}
                        onClick={isBookmarked ? () => removeBookmark(currentPage) : addBookmark}
                        aria-label="Закладка"
                    >
                        <FiBookmark />
                    </button>
                    <button
                        className="reader-btn"
                        onClick={() => setShowNoteEditor(!showNoteEditor)}
                        aria-label="Заметка"
                    >
                        <FiEdit3 />
                    </button>
                    <button className="reader-btn" onClick={toggleFullscreen} aria-label="Полный экран">
                        {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="reader-viewer" ref={viewerRef}>
                <iframe
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/books/${id}/view`}
                    title={book?.title}
                    className="pdf-iframe"
                />
            </div>

            {/* Sidebar with bookmarks and notes */}
            <div className="reader-sidebar">
                <div className="sidebar-section">
                    <h3>Закладки ({bookmarks.length})</h3>
                    <div className="bookmarks-list">
                        {bookmarks.map((bookmark, index) => (
                            <div key={index} className="bookmark-item">
                                <button onClick={() => setCurrentPage(bookmark.page)}>
                                    Страница {bookmark.page}
                                </button>
                                <button onClick={() => removeBookmark(bookmark.page)} className="remove-btn">
                                    <FiX />
                                </button>
                            </div>
                        ))}
                        {bookmarks.length === 0 && (
                            <p className="empty-message">Нет закладок</p>
                        )}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3>Заметки ({notes.length})</h3>
                    <div className="notes-list">
                        {notes.map((note) => (
                            <div key={note.id} className="note-item">
                                <div className="note-header">
                                    <span>Стр. {note.page}</span>
                                    <button onClick={() => {
                                        setEditingNote(note);
                                        setNoteText(note.text);
                                        setShowNoteEditor(true);
                                    }}>
                                        <FiEdit3 />
                                    </button>
                                </div>
                                <p>{note.text}</p>
                            </div>
                        ))}
                        {notes.length === 0 && (
                            <p className="empty-message">Нет заметок</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Note Editor Modal */}
            {showNoteEditor && (
                <div className="note-editor-modal">
                    <div className="note-editor">
                        <h3>{editingNote ? 'Редактировать заметку' : 'Новая заметка'}</h3>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Введите текст заметки..."
                            rows={6}
                        />
                        <div className="note-editor-actions">
                            <button className="btn-cancel" onClick={() => {
                                setShowNoteEditor(false);
                                setNoteText('');
                                setEditingNote(null);
                            }}>
                                Отмена
                            </button>
                            <button className="btn-save" onClick={saveNote}>
                                <FiSave /> Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="reader-navigation">
                <button
                    className="nav-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <FiChevronLeft /> Назад
                </button>
                <span className="page-indicator">
                    Страница {currentPage} из {totalPages || '...'}
                </span>
                <button
                    className="nav-btn"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={totalPages && currentPage >= totalPages}
                >
                    Вперёд <FiChevronRight />
                </button>
            </div>
        </div>
    );
};

export default ReaderPage;
