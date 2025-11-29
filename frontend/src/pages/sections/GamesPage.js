import React, { useState } from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/GamesPage.css';

const GamesPage = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'Все' },
        { id: 'business', label: 'Деловые игры' },
        { id: 'tech', label: 'Технологические игры' },
        { id: 'roleplay', label: 'Сюжетно-ролевые игры' },
        { id: 'team', label: 'Игра на командообразование' },
        { id: 'acquaintance', label: 'Игра на знакомства' },
        { id: 'collections', label: 'Сборники игр' },
    ];

    const games = [
        {
            id: 1,
            title: 'Сборник игр на знакомство №1',
            category: 'СБОРНИКИ ИГР',
            subcategory: 'ИГРА НА ЗНАКОМСТВА',
            color: 'blue',
            badge: '№1',
            filter: 'acquaintance'
        },
        {
            id: 2,
            title: 'Сборник игр на знакомство №2',
            category: 'СБОРНИКИ ИГР',
            subcategory: 'ИГРА НА ЗНАКОМСТВА',
            color: 'green',
            badge: '№2',
            filter: 'acquaintance'
        },
        {
            id: 3,
            title: 'Деловая игра "Переговоры"',
            category: 'ДЕЛОВЫЕ ИГРЫ',
            subcategory: 'ИГРА НА КОМАНДООБРАЗОВАНИЕ',
            color: 'yellow',
            badge: 'Переговоры',
            filter: 'business'
        },
    ];

    const filteredGames = activeFilter === 'all'
        ? games
        : games.filter(game => game.filter === activeFilter);

    return (
        <div className="games-page">
            {/* Hero Section */}
            <div className="games-hero">
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Игры и<br />упражнения
                        </h1>
                        <p className="hero-subtitle">
                            Раздел предлагает разнообразные игровые<br />
                            и тренировочные материалы, направленные<br />
                            на развитие командных и личных качеств пионеров.
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-games">
                            <div className="game-character character-1">
                                <div className="character-body yellow">🏆</div>
                            </div>
                            <div className="game-character character-2">
                                <div className="character-body yellow">💬</div>
                            </div>
                            <div className="game-character character-3">
                                <div className="character-body yellow">📱</div>
                            </div>
                            <div className="floating-element element-1">❤️</div>
                            <div className="floating-element element-2">👍</div>
                            <div className="floating-element element-3">💬</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Games Section */}
            <div className="games-content-section">
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

                {/* Games Grid */}
                <div className="games-grid">
                    {filteredGames.map((game, index) => (
                        <div
                            key={game.id}
                            className="game-card"
                            style={{ '--card-index': index }}
                        >
                            <div className={`game-card-image ${game.color}`}>
                                <div className="game-badge">{game.badge}</div>
                            </div>
                            <div className="game-card-body">
                                <h3 className="game-title">{game.title}</h3>
                                <div className="game-categories">
                                    <span className="game-category">{game.category}</span>
                                    <span className="game-subcategory">{game.subcategory}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GamesPage;
