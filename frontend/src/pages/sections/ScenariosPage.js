import React from 'react';
import Iridescence from '../../components/Iridescence';
import { MdTheaters } from 'react-icons/md';
import '../../styles/ScenariosPage.css';

const ScenariosPage = () => {
    return (
        <div className="scenarios-page">
            {/* Hero Section */}
            <div className="scenarios-hero">
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1}
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
                        <div className="hero-illustration">
                            <div className="icon-wrapper">
                                <MdTheaters className="main-icon" />
                            </div>
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
