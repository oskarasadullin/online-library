import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

// ============================================
// BOOKS API (объединённый)
// ============================================

export const booksAPI = {
    // Основные методы
    getAll: (params) => api.get('/books', { params }),
    getById: (id) => api.get(`/books/${id}`),
    download: (id) => api.get(`/books/${id}/download`, { responseType: 'blob' }),
    view: (id) => `/api/books/${id}/view`,

    create: (formData) => api.post('/books', formData, {
        headers: {
            'Content-Type': undefined
        }
    }),

    update: (id, data) => api.put(`/books/${id}`, data),
    delete: (id) => api.delete(`/books/${id}`),
    sync: () => api.post('/books/sync'),

    // ✅ Закладки
    getBookmarks: (bookId) => api.get(`/bookmarks/${bookId}`),
    addBookmark: (bookId, page) => api.post(`/bookmarks`, { book_id: bookId, page }),
    removeBookmark: (bookId, page) => api.delete(`/bookmarks/${bookId}/${page}`),

    // ✅ Заметки
    getNotes: (bookId) => api.get(`/notes/${bookId}`),
    createNote: (bookId, page, text) => api.post(`/notes`, { book_id: bookId, page, text }),
    updateNote: (noteId, text) => api.put(`/notes/${noteId}`, { text }),
    deleteNote: (noteId) => api.delete(`/notes/${noteId}`),

    // ✅ Модерация
    reportReview: (reviewId, reason, comment) => api.post(`/reports`, {
        review_id: reviewId,
        reason,
        comment
    }),
    getReports: () => api.get(`/admin/reports`),
    getReportsStats: () => api.get(`/admin/reports/stats`),
    resolveReport: (reportId, action) => api.post(`/admin/reports/${reportId}/resolve`, null, {
        params: { action }
    }),
};

// ============================================
// FAVORITES API
// ============================================

export const favoritesAPI = {
    getAll: () => api.get('/favorites'),
    add: (bookId) => api.post(`/favorites/${bookId}`),
    remove: (bookId) => api.delete(`/favorites/${bookId}`),
};

// ============================================
// READ STATUS API
// ============================================

export const readStatusAPI = {
    markAsRead: (bookId) => api.post(`/read/${bookId}`),
    markAsUnread: (bookId) => api.delete(`/read/${bookId}`),
};

// ============================================
// REVIEWS API
// ============================================

export const reviewsAPI = {
    getByBook: (bookId) => api.get(`/reviews/${bookId}`),
    create: (data) => api.post('/reviews', data),
};

// ============================================
// RATINGS API
// ============================================

export const ratingsAPI = {
    create: (data) => api.post('/ratings', data),
};

// ============================================
// FILTERS API
// ============================================

export const filtersAPI = {
    getTags: () => api.get('/filters/tags'),
    getGenres: () => api.get('/filters/genres'),
    getAuthors: () => api.get('/filters/authors'),
};

export default api;
