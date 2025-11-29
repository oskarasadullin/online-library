import React from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/MethodClubPage.css';

const MethodClubPage = () => {
    return (
        <div className="method-club-page">
            {/* Hero Section */}
            <div className="method-club-hero">
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Методический<br />клуб
                        </h1>
                        <p className="hero-subtitle">
                            Эфиры, подкасты, подборки советов и курсы<br />
                            от Научно-методического центра
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration">
                            <div className="illustration-phone">
                                <div className="phone-screen">
                                    <div className="screen-content">
                                        <div className="profile-item"></div>
                                        <div className="profile-item"></div>
                                        <div className="profile-item"></div>
                                        <div className="profile-item"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="floating-element element-1">💡</div>
                            <div className="floating-element element-2">📚</div>
                            <div className="floating-element element-3">🎯</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Materials Section */}
            <div className="method-club-materials">
                <h2 className="materials-title">Материалы клуба</h2>
                <div className="materials-content">
                    <div className="materials-grid">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="material-card">
                                <div className="card-image-placeholder"></div>
                                <div className="card-content">
                                    <div className="card-category">Категория</div>
                                    <div className="card-title-placeholder"></div>
                                    <div className="card-text-placeholder"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MethodClubPage;
