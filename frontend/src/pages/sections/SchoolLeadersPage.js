import React from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/SchoolLeadersPage.css';

const SchoolLeadersPage = () => {
    return (
        <div className="school-leaders-page">
            {/* Hero Section */}
            <div className="school-leaders-hero">
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Про отрядных<br />вожатых
                        </h1>
                        <p className="hero-subtitle">
                            Кто такой отрядный вожатый?<br />
                            Это старшеклассников готовый помочь вам<br />
                            в работе с детскими общественными объединениями.
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-leaders">
                            <div className="leaders-table">
                                <div className="table-top"></div>
                                <div className="table-legs"></div>
                            </div>
                            <div className="leader-character leader-1">
                                <div className="character-icon">👤</div>
                            </div>
                            <div className="leader-character leader-2">
                                <div className="character-icon">👤</div>
                            </div>
                            <div className="floating-element element-1">📋</div>
                            <div className="floating-element element-2">✏️</div>
                            <div className="floating-element element-3">📚</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="leaders-content-section">
                <h2 className="section-title">Работа с отрядными вожатыми</h2>
                <div className="content-placeholder">
                    <p className="placeholder-text">Материалы скоро появятся</p>
                </div>
            </div>
        </div>
    );
};

export default SchoolLeadersPage;
