import React from 'react';
import Iridescence from '../../components/Iridescence';
import { GiSoundWaves } from 'react-icons/gi';
import '../../styles/MethodClubPage.css';

const MethodClubPage = () => {
    return (
        <div className="method-club-page">
            {/* Hero Section */}
            <div className="method-club-hero">
                <Iridescence color={[0.5, 0.6, 0.8]} mouseReact={false} amplitude={0.1} speed={1} />
                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Методический<br />
                            клуб
                        </h1>
                        <p className="hero-subtitle">
                            Эфиры, подкасты, подборки советов и курсы<br />
                            от Научно-методического центра
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration">
                            <div className="soundwave-icon-wrapper">
                                <GiSoundWaves className="main-soundwave-icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Method Club Content Section */}
            <div className="method-club-content-section">
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

export default MethodClubPage;
