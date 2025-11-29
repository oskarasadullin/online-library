import React from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/CalendarPage.css';

const CalendarPage = () => {
    return (
        <div className="calendar-page">
            {/* Hero Section */}
            <div className="calendar-hero">
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Календарь<br />воспитания
                        </h1>
                        <p className="hero-subtitle">
                            Актуальная информация о деятельности<br />
                            детского движения
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-calendar">
                            <div className="calendar-widget">
                                <div className="calendar-rings">
                                    <div className="ring"></div>
                                    <div className="ring"></div>
                                    <div className="ring"></div>
                                    <div className="ring"></div>
                                    <div className="ring"></div>
                                </div>
                                <div className="calendar-body">
                                    <div className="calendar-date">📅</div>
                                    <div className="calendar-event green">✓</div>
                                    <div className="calendar-event pending">○</div>
                                </div>
                            </div>
                            <div className="person-with-calendar">👤</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="calendar-content">
                <div className="content-placeholder">
                    <p className="placeholder-text">События календаря скоро появятся</p>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
