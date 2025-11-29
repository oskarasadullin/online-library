import React, { useState } from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/PioneersWorkPage.css';

const PioneersWorkPage = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'Все' },
        { id: 'admission', label: 'Прием в пионеры' },
        { id: 'first-steps', label: 'Первые дела' },
        { id: 'traditions', label: 'Пионерские традиции' },
        { id: 'technology', label: 'Пионерская технология' },
        { id: 'directions', label: 'Направления воспитательной работы с пионерами' },
    ];

    const cards = [
        {
            id: 1,
            category: 'ПРИЕМ В ПИОНЕРЫ',
            title: 'Организация приема в Пионеры Башкортостана',
            image: 'https://via.placeholder.com/400x250',
            filter: 'admission'
        },
        {
            id: 2,
            category: 'ПРИЕМ В ПИОНЕРЫ',
            title: 'Как рассказать родителям о Пионерах Башкортостана',
            image: 'https://via.placeholder.com/400x250',
            filter: 'admission'
        },
        {
            id: 3,
            category: 'ПРИЕМ В ПИОНЕРЫ',
            title: 'Что нужно знать о современных пионерах и организации "Пионеры Башкортостана"',
            image: 'https://via.placeholder.com/400x250',
            filter: 'admission'
        },
        {
            id: 4,
            category: 'ПРИЕМ В ПИОНЕРЫ',
            title: 'Как инициировать прием школьников в Пионеры Башкортостана',
            image: 'https://via.placeholder.com/400x250',
            filter: 'admission'
        },
    ];

    const filteredCards = activeFilter === 'all'
        ? cards
        : cards.filter(card => card.filter === activeFilter);

    return (
        <div className="pioneers-work-page">
            {/* Hero Section */}
            <div className="pioneers-hero">
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Работа<br />с пионерами
                        </h1>
                        <p className="hero-subtitle">
                            Здесь представлены программы, методические<br />
                            рекомендации и практические советы по организации<br />
                            работы с детьми и молодежью
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-pioneers">
                            <div className="books-stack">
                                <div className="book book-1"></div>
                                <div className="book book-2"></div>
                                <div className="book book-3"></div>
                                <div className="book book-4"></div>
                            </div>
                            <div className="pioneer-character">
                                <div className="character-body"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Getting Started Section */}
            <div className="getting-started-section">
                <h2 className="section-title">
                    С чего начать?
                </h2>

                {/* Filters */}
                <div className="filters-container">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter.id)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Cards Grid */}
                <div className="pioneers-cards-grid">
                    {filteredCards.map((card, index) => (
                        <div
                            key={card.id}
                            className="pioneer-card"
                            style={{ '--card-index': index }}
                        >
                            <div className="card-image">
                                <img src={card.image} alt={card.title} />
                            </div>
                            <div className="card-body">
                                <span className="card-category">{card.category}</span>
                                <h3 className="card-title">{card.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pioneer Assembly Section */}
            <div className="pioneer-assembly-section">
                <h2 className="section-title">Пионерский сбор</h2>
                <div className="assembly-content">
                    <p className="assembly-placeholder">Материалы скоро появятся</p>
                </div>
            </div>
        </div>
    );
};

export default PioneersWorkPage;
