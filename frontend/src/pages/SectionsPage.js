import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/SectionsPage.css';


const SectionsPage = ({ children }) => {
    const location = useLocation();


    const sections = [
        { id: 'methodclub', name: 'Методический клуб', path: '/sections/methodclub' },
        { id: 'pioneers', name: 'Работа с пионерами', path: '/sections/pioneers' },
        { id: 'leaders', name: 'Школа отрядных вожатых', path: '/sections/leaders' },
        { id: 'volunteers', name: 'Волонтерский отряд', path: '/sections/volunteers' },
        { id: 'media', name: 'Школьный медиа-центр', path: '/sections/media' },
        { id: 'games', name: 'Игры и упражнения', path: '/sections/games' },
        { id: 'scenarios', name: 'Сценарии мероприятий', path: '/sections/scenarios' },
        { id: 'book', name: 'Пионерская организация - как это делается', path: '/sections/book' },
        { id: 'exchange', name: 'Обмен опытом', path: '/sections/exchange' }, // ✅ ДОБАВЛЕНО
        { id: 'contacts', name: 'Контакты', path: '/sections/contacts' }, // ✅ ДОБАВЛЕНО
        { id: 'calendar', name: 'Календарь воспитания', path: '/sections/calendar' }, // ✅ ДОБАВЛЕНО
        { id: 'documents', name: 'Документы и нормативно-правовая база', path: '/sections/documents' }, // ✅ ДОБАВЛЕНО
    ];




    const isActive = (path) => location.pathname === path;


    return (
        <div className="sections-page">
            <div className="sections-container">
                <nav className="sections-nav">
                    <div className="sections-tabs">
                        {sections.map((section) => (
                            <Link
                                key={section.id}
                                to={section.path}
                                className={`section-tab ${isActive(section.path) ? 'active' : ''}`}
                            >
                                {section.name}
                            </Link>
                        ))}
                    </div>
                </nav>


                <div className="section-content">
                    {children}
                </div>
            </div>
        </div>
    );
};


export default SectionsPage;
