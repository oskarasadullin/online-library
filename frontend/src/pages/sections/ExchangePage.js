import React from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/ExchangePage.css';

const ExchangePage = () => {
    const steps = [
        {
            number: '1',
            title: 'Заявите о себе',
            description: 'We are a leading firm in providing quality and value to our customers. Each member of our team has at least five years of legal experience. We love what we do.'
        },
        {
            number: '2',
            title: 'Пройдите модерацию',
            description: 'Our managers are always ready to answer your questions. You can call us during the weekends and at night. You can also visit our office for a personal consultation.'
        },
        {
            number: '3',
            title: 'Получите сертификат',
            description: 'Our company works according to the principle of individual approach to every client. This method allows us to achieve success in problems of all levels.'
        }
    ];

    return (
        <div className="exchange-page">
            {/* Hero Section */}
            <div className="exchange-hero">
                <Iridescence
                    color={[0.4, 0.49, 0.92]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={0.5}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Делитесь<br />вашими<br />разработками
                        </h1>
                        <p className="hero-subtitle">
                            В этом разделе собраны материалы<br />
                            для педагогов и вожатых, включая статьи,<br />
                            рекомендации и лучшие практики работы с детьми.
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-exchange">
                            <div className="team-group">
                                <div className="team-member member-1">👤</div>
                                <div className="team-member member-2">👤</div>
                                <div className="team-member member-3">👤</div>
                                <div className="team-member member-4">👤</div>
                            </div>
                            <div className="presentation-screen">
                                <div className="screen-content">💻</div>
                            </div>
                            <div className="presenter">👤</div>
                            <div className="floating-element element-1">💡</div>
                            <div className="floating-element element-2">❗</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <div className="steps-section">
                <h2 className="section-title">Этапы публикации ваших материалов</h2>

                <div className="steps-grid">
                    {steps.map((step, index) => (
                        <div key={index} className="step-card" style={{ '--step-index': index }}>
                            <div className="step-number">{step.number}</div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-description">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExchangePage;
