import React from 'react';
import Iridescence from '../../components/Iridescence';
import { GiNotebook } from 'react-icons/gi';
import '../../styles/PioneerBookPage.css';

const PioneerBookPage = () => {
    const bookSections = [
        'ПРЕДИСЛОВИЕ',
        'ИСТОРИЯ ПИОНЕРСКОЙ ОРГАНИЗАЦИИ',
        'ПИОНЕРСКИЕ ТРАДИЦИИ',
        'РАБОТА С МЛАДШИМИ ПИОНЕРАМИ',
        'РАБОТА С ПИОНЕРАМИ СРЕДНЕГО ВОЗРАСТА',
        'РАБОТА СО СТАРШИМИ ПИОНЕРАМИ',
        'ПИОНЕРСКАЯ ТЕХНОЛОГИЯ',
        'НАПРАВЛЕНИЯ ВОСПИТАТЕЛЬНОЙ РАБОТЫ С ПИОНЕРАМИ',
    ];

    return (
        <div className="pioneer-book-page">
            {/* Hero Section */}
            <div className="pioneer-book-hero">
                <Iridescence
                    color={[0.5, 0.6, 0.8]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Пионерская<br />организация —<br />как это делается
                        </h1>
                        <p className="hero-subtitle">
                            Настольная книга пионерского вожатого
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration">
                            <div className="icon-wrapper">
                                <GiNotebook className="main-icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Book Info Section */}
            <div className="book-info-section">
                <h2 className="section-title">Про книгу</h2>
                <div className="book-description">
                    <p>
                        Настольная книга пионерского вожатого "Пионерская организация - как это делается" издана в
                        2000 году на основе методической сокровищницы пионерского наследия. Составителями
                        выступили - Артем Клименко и Тимур Гагин. Под рецензией Ирины Антоновой.
                    </p>
                    <p>
                        В 2025 году Настольной книге пионерского вожатого - 25 лет. Юбилей серьезный. Технологии и
                        методики, материалы, описанные в ней не все устарели, но появились и новые инструменты
                        работы, о которых вы можете узнать на страницах нашего сервиса.
                    </p>
                    <p>
                        Книга в электронном формате загружена в 10 основных разделов и позволяет познакомится с
                        основным спектором вопросов развития детского движения. Здесь вы получите ответы на
                        начальные вопросы: кто такой пионер, что нужно знать о пионерских символах, какие есть
                        пионерские ритуалы, про пионерскую технологию и особенности работы с пионерами разных
                        возрастов.
                    </p>
                    <p>
                        В 2025 году Научно-методический центр нашей организации займется обновление данной книги,
                        если у вас есть идеи или пожелания, вы можете их направить на почту:{' '}
                        <a href="mailto:peoneerrb-metod@yandex.ru" className="email-link">
                            peoneerrb-metod@yandex.ru
                        </a>
                    </p>
                </div>
            </div>

            {/* Table of Contents */}
            <div className="table-of-contents-section">
                <h2 className="section-title">СОДЕРЖАНИЕ</h2>
                <div className="contents-grid">
                    {bookSections.map((section, index) => (
                        <div key={index} className="content-card">
                            <div className="content-card-pattern"></div>
                            <h3 className="content-card-title">{section}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PioneerBookPage;
