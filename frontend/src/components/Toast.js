import React, { useEffect } from 'react';
import '../styles/Toast.css';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX, FiClock } from 'react-icons/fi';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <FiCheckCircle />,
        error: <FiAlertCircle />,
        warning: <FiClock />,
        info: <FiInfo />
    };

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">{icons[type]}</div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose} aria-label="Закрыть">
                <FiX />
            </button>
        </div>
    );
};

export default Toast;
