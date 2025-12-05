import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import Iridescence from '../components/Iridescence';
import { FiAlertTriangle, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import '../styles/ModerationPage.css';

const ModerationPage = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [filter, setFilter] = useState('pending');

    const pendingCardRef = useRef(null);
    const resolvedCardRef = useRef(null);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        loadReports();
    }, [isAdmin, navigate]);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        [pendingCardRef, resolvedCardRef].forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => observer.disconnect();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await booksAPI.getReports();
            setReports(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load reports:', error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (reportId, action) => {
        setProcessing(reportId);
        try {
            await booksAPI.resolveReport(reportId, action);
            await loadReports();
        } catch (error) {
            console.error('Failed to resolve report:', error);
            alert('Ошибка при обработке жалобы');
        } finally {
            setProcessing(null);
        }
    };

    const pendingReports = reports.filter(r => r.status === 'pending');
    const resolvedReports = reports.filter(r => r.status !== 'pending');

    const getReasonText = (reason) => {
        const reasons = {
            spam: 'Спам',
            offensive: 'Оскорбительный контент',
            inappropriate: 'Неуместный контент',
            other: 'Другое'
        };
        return reasons[reason] || reason;
    };

    if (!isAdmin) return null;

    return (
        <div className="moderation-page">
            {/* Hero Section */}
            <div className="moderation-hero">
                <Iridescence color={[0.9, 0.5, 0.3]} mouseReact={false} amplitude={0.1} speed={1} />
                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Модерация<br />
                            отзывов
                        </h1>
                        <p className="hero-subtitle">
                            Обработка жалоб пользователей<br />
                            на отзывы к книгам
                        </p>
                    </div>
                    <div className="hero-image">
                        <div className="hero-illustration">
                            <FiAlertTriangle className="main-icon" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="moderation-content-section">
                <div className="moderation-container">
                    {/* Pending Reports Card */}
                    <div ref={pendingCardRef} className="moderation-card">
                        <div className="card-header">
                            <h2 className="card-title">Ожидают обработки</h2>
                            <p className="card-description">
                                Жалобы на отзывы, требующие вашего решения ({pendingReports.length})
                            </p>
                        </div>

                        {loading ? (
                            <div className="card-loading">
                                <div className="loading-spinner"></div>
                                <span>Загрузка...</span>
                            </div>
                        ) : pendingReports.length === 0 ? (
                            <div className="card-empty">
                                <span className="empty-icon">✓</span>
                                <p className="empty-text">Нет ожидающих жалоб</p>
                            </div>
                        ) : (
                            <div className="reports-list">
                                {pendingReports.map(report => (
                                    <div key={report.id} className="report-item">
                                        <div className="report-info">
                                            <div className="report-meta">
                                                <span className="report-reason">
                                                    {getReasonText(report.reason)}
                                                </span>
                                                <span className="report-date">
                                                    {new Date(report.created_at).toLocaleDateString('ru-RU')}
                                                </span>
                                            </div>

                                            <div className="report-content">
                                                <div className="content-label">Отзыв:</div>
                                                <p className="content-text">{report.review?.text}</p>
                                                <div className="content-author">
                                                    — {report.review?.user_name}
                                                </div>
                                            </div>

                                            {report.comment && (
                                                <div className="report-comment">
                                                    <div className="content-label">Причина жалобы:</div>
                                                    <p className="content-text">{report.comment}</p>
                                                    <div className="content-author">
                                                        — {report.reporter_name}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="report-actions">
                                            <button
                                                className="btn-primary btn-delete"
                                                onClick={() => handleResolve(report.id, 'delete_review')}
                                                disabled={processing === report.id}
                                            >
                                                {processing === report.id ? (
                                                    <>
                                                        <span className="btn-spinner"></span>
                                                        <span>Обработка...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiTrash2 />
                                                        <span>Удалить отзыв</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => handleResolve(report.id, 'dismiss')}
                                                disabled={processing === report.id}
                                            >
                                                {processing === report.id ? (
                                                    <>
                                                        <span className="btn-spinner"></span>
                                                        <span>Обработка...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiCheck />
                                                        <span>Отклонить жалобу</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resolved Reports Card */}
                    <div ref={resolvedCardRef} className="moderation-card">
                        <div className="card-header">
                            <h2 className="card-title">История обработанных жалоб</h2>
                            <p className="card-description">
                                Решённые и отклонённые жалобы ({resolvedReports.length})
                            </p>
                        </div>

                        {loading ? (
                            <div className="card-loading">
                                <div className="loading-spinner"></div>
                                <span>Загрузка...</span>
                            </div>
                        ) : resolvedReports.length === 0 ? (
                            <div className="card-empty">
                                <span className="empty-icon">📋</span>
                                <p className="empty-text">История пуста</p>
                            </div>
                        ) : (
                            <div className="reports-history">
                                {resolvedReports.map(report => (
                                    <div key={report.id} className="history-item">
                                        <div className="history-header">
                                            <span className={`status-badge ${report.status}`}>
                                                {report.status === 'resolved' ? (
                                                    <>
                                                        <FiCheck /> Решено
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiX /> Отклонено
                                                    </>
                                                )}
                                            </span>
                                            <span className="history-date">
                                                {new Date(report.resolved_at).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        <div className="history-reason">
                                            {getReasonText(report.reason)}
                                        </div>
                                        <div className="history-review">
                                            "{report.review?.text}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModerationPage;
