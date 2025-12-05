import React from 'react';
import Iridescence from '../../components/Iridescence';
import { MdPermMedia } from 'react-icons/md';
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
                        <div className="hero-illustration">
                            <div className="icon-wrapper">
                                <MdPermMedia className="main-icon" />
                            </div>
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
