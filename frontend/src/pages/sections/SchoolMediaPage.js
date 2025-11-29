import React from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/SchoolMediaPage.css';

const SchoolMediaPage = () => {
    return (
        <div className="school-media-page">
            {/* Hero Section */}
            <div className="school-media-hero">
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Школьный<br />медиа-центр
                        </h1>
                        <p className="hero-subtitle">
                            Текст подзаголовок
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-media">
                            <div className="media-podium">
                                <div className="podium-top">
                                    <div className="podium-number">1</div>
                                </div>
                                <div className="podium-base"></div>
                            </div>
                            <div className="media-character character-left">
                                <div className="character-body">
                                    <div className="trophy-icon">🏆</div>
                                </div>
                            </div>
                            <div className="media-character character-right">
                                <div className="character-body">
                                    <div className="laptop-icon">💻</div>
                                </div>
                            </div>
                            <div className="floating-element element-1">💬</div>
                            <div className="floating-element element-2">▶️</div>
                            <div className="floating-element element-3">❤️</div>
                            <div className="floating-element element-4">📊</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="media-content-section">
                <h2 className="section-title">Материалы медиа-центра</h2>
                <div className="content-placeholder">
                    <p className="placeholder-text">Материалы скоро появятся</p>
                </div>
            </div>
        </div>
    );
};

export default SchoolMediaPage;
