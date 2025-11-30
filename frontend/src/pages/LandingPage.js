import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Ballpit from '../components/Ballpit';
import '../styles/LandingPage.css';

const LandingPage = () => {
    const [activeAccordion, setActiveAccordion] = useState(null);

    const sectionTitleRef = useRef(null);
    const sectionSubtitleRef = useRef(null);
    const featureCardsRef = useRef([]);

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        if (sectionTitleRef.current) observer.observe(sectionTitleRef.current);
        if (sectionSubtitleRef.current) observer.observe(sectionSubtitleRef.current);

        featureCardsRef.current.forEach(card => {
            if (card) observer.observe(card);
        });

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: '📚',
            title: 'Огромная библиотека',
            description: 'Доступ к тысячам книг различных жанров — от классики до современной литературы.',
            link: '/books'
        },
        {
            icon: '🔍',
            title: 'Умный поиск',
            description: 'Мгновенный поиск по названию, автору, жанру и тегам с интеллектуальными подсказками.',
            link: '/books'
        },
        {
            icon: '💾',
            title: 'Личная коллекция',
            description: 'Сохраняйте любимые книги и создавайте собственную цифровую библиотеку.',
            link: '/books'
        },
        {
            icon: '⭐',
            title: 'Оценки и отзывы',
            description: 'Делитесь впечатлениями и находите новые книги по рекомендациям сообщества.',
            link: '/books'
        },
        {
            icon: '📖',
            title: 'Онлайн-чтение',
            description: 'Читайте прямо в браузере с комфортным интерфейсом и настройками отображения.',
            link: '/books'
        },
        {
            icon: '📥',
            title: 'Оффлайн-доступ',
            description: 'Скачивайте книги для чтения без подключения к интернету в любое время.',
            link: '/books'
        }
    ];

    const faqs = [
        {
            question: 'Нужна ли регистрация для использования библиотеки?',
            answer: 'Регистрация не обязательна для просмотра и скачивания книг. Она требуется только для добавления в избранное, оценок и написания отзывов.'
        },
        {
            question: 'Как найти нужную книгу?',
            answer: 'Используйте поиск по названию, автору или описанию. Также доступны удобные фильтры по жанрам, тегам и авторам для точного результата.'
        },
        {
            question: 'Можно ли читать книги онлайн?',
            answer: 'Да, все книги можно читать прямо в браузере без необходимости скачивания. Просто откройте книгу и начните чтение с любого устройства.'
        }
    ];

    return (
        <div className="landing-page">
            <section className="hero-section">
                {/* Ballpit фон */}
                <div className="hero-ballpit-container">
                    <Ballpit
                        count={200}
                        colors={[0x00e965, 0x667eea, 0x764ba2]}
                        gravity={0.01}
                        friction={0.9975}
                        wallBounce={0.95}
                        followCursor={false}
                        minSize={0.4}
                        maxSize={1.0}
                        materialParams={{
                            metalness: 0.5,
                            roughness: 0.5,
                            clearcoat: 1,
                            clearcoatRoughness: 0.15
                        }}
                    />
                </div>

                {/* Контент поверх Ballpit */}
                <div className="hero-content">
                    <h1 className="hero-title">Методическая библиотека Пионеров Башкортостана</h1>
                    <p className="hero-description">
                        Читайте, обучайтесь, сохраняйте материалы и делитесь впечатлениями о любимых произведениях
                    </p>
                    <div className="hero-actions">
                        <Link to="/books" className="btn-primary">
                            <span>Перейти к книгам</span>
                            <span>→</span>
                        </Link>
                        <a href="#features" className="btn-secondary">
                            <span>Узнать больше</span>
                        </a>
                    </div>
                </div>
            </section>

            <section id="features" className="features-section">
                <h2 className="section-title" ref={sectionTitleRef}>Возможности</h2>
                <p className="section-subtitle" ref={sectionSubtitleRef}>
                    Всё необходимое для комфортного чтения и управления вашей библиотекой
                </p>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            className="feature-card"
                            key={index}
                            ref={el => featureCardsRef.current[index] = el}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                            <Link to={feature.link} className="feature-link">
                                <span>Подробнее</span>
                                <span>→</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="faq-section">
                <h2 className="section-title" style={{ opacity: 1, transform: 'none' }}>Частые вопросы</h2>
                <p className="section-subtitle" style={{ opacity: 1, transform: 'none' }}>
                    Ответы на самые популярные вопросы о нашей библиотеке
                </p>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div
                            className={`faq-accordion ${activeAccordion === index ? 'active' : ''}`}
                            key={index}
                        >
                            <div
                                className="faq-accordion-header"
                                onClick={() => toggleAccordion(index)}
                            >
                                <h3>{faq.question}</h3>
                                <div className="faq-accordion-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="faq-accordion-body">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
