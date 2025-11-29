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
            // Только очищаем token, НЕ перенаправляем
            localStorage.removeItem('token');
            // Редирект обработает AuthContext или сам компонент
        }
        return Promise.reject(error);
    }
);


export const booksAPI = {
    getAll: (params) => api.get('/books', { params }),
    getById: (id) => api.get(`/books/${id}`),
    download: (id) => api.get(`/books/${id}/download`, { responseType: 'blob' }),
    view: (id) => `/api/books/${id}/view`,

    // ИСПРАВЛЕНО: Удаляем Content-Type, чтобы axios сам установил boundary
    create: (formData) => api.post('/books', formData, {
        headers: {
            'Content-Type': undefined  // Или просто не указывать вообще
        }
    }),

    update: (id, data) => api.put(`/books/${id}`, data),
    delete: (id) => api.delete(`/books/${id}`),
    sync: () => api.post('/books/sync'),
};

export const favoritesAPI = {
    getAll: () => api.get('/favorites'),
    add: (bookId) => api.post(`/favorites/${bookId}`),
    remove: (bookId) => api.delete(`/favorites/${bookId}`),
};

export const readStatusAPI = {
    markAsRead: (bookId) => api.post(`/read/${bookId}`),
    markAsUnread: (bookId) => api.delete(`/read/${bookId}`),
};

export const reviewsAPI = {
    getByBook: (bookId) => api.get(`/reviews/${bookId}`),
    create: (data) => api.post('/reviews', data),
};

export const ratingsAPI = {
    create: (data) => api.post('/ratings', data),
};

export const filtersAPI = {
    getTags: () => api.get('/filters/tags'),
    getGenres: () => api.get('/filters/genres'),
    getAuthors: () => api.get('/filters/authors'),
};

export default api;
