import React from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/ContactsPage.css';

const ContactsPage = () => {
    return (
        <div className="contacts-page">
            {/* Hero Section */}
            <div className="contacts-hero">
                <Iridescence
                    color={[0.4, 0.49, 0.92]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={0.5}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Наши<br />контакты
                        </h1>
                        <p className="hero-subtitle">
                            Региональная детская общественная организация<br />
                            "Пионеры Башкортостана"
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-contacts">
                            <div className="contact-card">
                                <div className="card-icon">📧</div>
                                <div className="card-lines">
                                    <div className="line"></div>
                                    <div className="line"></div>
                                    <div className="line"></div>
                                </div>
                            </div>
                            <div className="floating-element element-1">📞</div>
                            <div className="floating-element element-2">📍</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="contacts-content">
                <div className="content-placeholder">
                    <p className="placeholder-text">Контактная информация скоро появится</p>
                </div>
            </div>
        </div>
    );
};

export default ContactsPage;
