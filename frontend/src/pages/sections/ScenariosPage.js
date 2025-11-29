import React from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/ScenariosPage.css';

const ScenariosPage = () => {
    return (
        <div className="scenarios-page">
            {/* Hero Section */}
            <div className="scenarios-hero">
                <Iridescence
                    color={[0.4, 0.49, 0.92]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={0.5}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Сценарии<br />мероприятий
                        </h1>
                        <p className="hero-subtitle">
                            В разделе представлены программы<br />
                            для праздников, конкурсов, слетов и других событий,<br />
                            которые помогут организовать незабываемые<br />
                            и увлекательные события для пионеров.
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-scenarios">
                            <div className="theater-stage">
                                <div className="stage-curtain left"></div>
                                <div className="stage-curtain right"></div>
                                <div className="stage-performers">
                                    <div className="performer performer-1">🐰</div>
                                    <div className="performer performer-2">🐰</div>
                                </div>
                            </div>
                            <div className="audience audience-left">👤</div>
                            <div className="audience audience-right">👤</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="scenarios-content-section">
                <h2 className="section-title">Сценарии</h2>
                <div className="content-placeholder">
                    <p className="placeholder-text">Материалы скоро появятся</p>
                </div>
            </div>
        </div>
    );
};

export default ScenariosPage;
