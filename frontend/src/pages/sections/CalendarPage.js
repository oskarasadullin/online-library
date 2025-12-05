import React from 'react';
import Iridescence from '../../components/Iridescence';
import { IoCalendar } from 'react-icons/io5';
import '../../styles/CalendarPage.css';

const CalendarPage = () => {
    return (
        <div className="calendar-page">
            <div className="calendar-hero">
                <Iridescence color={[0.5, 0.6, 0.8]} mouseReact={false} amplitude={0.1} speed={1} />
                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Календарь<br />
                            событий
                        </h1>
                        <p className="hero-subtitle">
                            Расписание мероприятий<br />
                            и важные даты
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration">
                            <div className="icon-wrapper">
                                <IoCalendar className="main-icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-section">
                <div className="content-container">
                    <h2 className="section-title">Скоро здесь появится контент</h2>
                    <p className="section-description">
                        Мы работаем над наполнением этого раздела полезными материалами
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
