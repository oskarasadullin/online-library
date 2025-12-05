import React, { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { booksAPI } from '../services/api';
import { useToast } from './ToastContainer';
import '../styles/ReportModal.css';

const ReportModal = ({ review, onClose, onSuccess }) => {
    const { showSuccess, showError } = useToast();
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const reasons = [
        { value: 'spam', label: 'Спам или реклама' },
        { value: 'offensive', label: 'Оскорбительный контент' },
        { value: 'inappropriate', label: 'Неуместный контент' },
        { value: 'other', label: 'Другое' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            showError('Выберите причину жалобы');
            return;
        }

        setLoading(true);
        try {
            await booksAPI.reportReview(review.id, reason, comment);
            showSuccess('Жалоба отправлена. Модераторы рассмотрят её в ближайшее время');
            onSuccess?.();
            onClose();
        } catch (error) {
            showError(error.response?.data?.detail || 'Не удалось отправить жалобу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <FiAlertTriangle />
                        <h2>Пожаловаться на отзыв</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="report-form">
                    <div className="review-preview">
                        <p className="review-author">{review.user_name}</p>
                        <p className="review-text">{review.text}</p>
                    </div>

                    <div className="form-group">
                        <label>Причина жалобы *</label>
                        <div className="radio-group">
                            {reasons.map((r) => (
                                <label key={r.value} className="radio-label">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                    <span>{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Дополнительная информация</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Опишите проблему подробнее..."
                            rows={4}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading || !reason}>
                            {loading ? 'Отправка...' : 'Отправить жалобу'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
