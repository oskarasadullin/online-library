import React from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/VolunteersPage.css';

const VolunteersPage = () => {
    return (
        <div className="volunteers-page">
            {/* Hero Section */}
            <div className="volunteers-hero">
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Волонтерский<br />отряд
                        </h1>
                        <p className="hero-subtitle">
                            Рассказываем, как выстроить работу<br />
                            с добровольческим объединением
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-volunteers">
                            <div className="volunteer-character character-1">
                                <div className="puzzle-piece piece-green"></div>
                            </div>
                            <div className="volunteer-character character-2">
                                <div className="puzzle-piece piece-yellow"></div>
                            </div>
                            <div className="volunteer-character character-3">
                                <div className="puzzle-piece piece-blue"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="volunteers-content-section">
                <h2 className="section-title">Работа с добровольческим объединением</h2>
                <div className="content-placeholder">
                    <p className="placeholder-text">Материалы скоро появятся</p>
                </div>
            </div>
        </div>
    );
};

export default VolunteersPage;
