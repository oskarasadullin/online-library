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
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sections-page">
            {/* Постоянный градиент фон - ВСЕГДА виден */}
            <div className="sections-permanent-background"></div>

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
