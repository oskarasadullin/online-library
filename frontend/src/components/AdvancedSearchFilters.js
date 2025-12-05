import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiFilter, FiX, FiMic, FiMicOff, FiSliders } from 'react-icons/fi';
import CustomSelect from './CustomSelect';
import { filtersAPI } from '../services/api';
import '../styles/AdvancedSearchFilters.css';

const AdvancedSearchFilters = ({ onFilterChange, onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [yearFrom, setYearFrom] = useState('');
    const [yearTo, setYearTo] = useState('');
    const [pagesFrom, setPagesFrom] = useState('');
    const [pagesTo, setPagesTo] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const [tags, setTags] = useState([]);
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);

    const recognitionRef = useRef(null);

    useEffect(() => {
        loadFilterOptions();
        initSpeechRecognition();
    }, []);

    const loadFilterOptions = async () => {
        try {
            const [tagsData, genresData, authorsData] = await Promise.all([
                filtersAPI.getTags(),
                filtersAPI.getGenres(),
                filtersAPI.getAuthors()
            ]);
            setTags(tagsData.tags || []);
            setGenres(genresData.genres || []);
            setAuthors(authorsData.authors || []);
        } catch (error) {
            console.error('Failed to load filters:', error);
        }
    };

    const initSpeechRecognition = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'ru-RU';
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
                handleSearch(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    };

    const toggleVoiceSearch = () => {
        if (!recognitionRef.current) {
            alert('Голосовой поиск не поддерживается вашим браузером');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSearch = (query = searchQuery) => {
        const filters = {
            search: query,
            tag: selectedTag,
            genre: selectedGenre,
            author: selectedAuthor,
            yearFrom,
            yearTo,
            pagesFrom,
            pagesTo
        };
        onFilterChange?.(filters);
        onSearch?.(query);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedTag('');
        setSelectedGenre('');
        setSelectedAuthor('');
        setYearFrom('');
        setYearTo('');
        setPagesFrom('');
        setPagesTo('');
        onFilterChange?.({});
    };

    const hasActiveFilters = selectedTag || selectedGenre || selectedAuthor ||
        yearFrom || yearTo || pagesFrom || pagesTo;

    return (
        <div className="advanced-search-filters">
            {/* Основная поисковая строка */}
            <div className="search-bar-wrapper">
                <div className="search-bar">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по книгам..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            className="clear-search-btn"
                            onClick={() => {
                                setSearchQuery('');
                                handleSearch('');
                            }}
                            aria-label="Очистить поиск"
                        >
                            <FiX />
                        </button>
                    )}
                    <button
                        className={`voice-search-btn ${isListening ? 'listening' : ''}`}
                        onClick={toggleVoiceSearch}
                        aria-label="Голосовой поиск"
                        title={isListening ? 'Остановить запись' : 'Голосовой поиск'}
                    >
                        {isListening ? <FiMicOff /> : <FiMic />}
                    </button>
                </div>

                <button
                    className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    <FiSliders />
                    Расширенный поиск
                </button>
            </div>

            {/* Быстрые фильтры */}
            <div className="quick-filters">
                <CustomSelect
                    options={tags}
                    value={selectedTag}
                    onChange={(value) => {
                        setSelectedTag(value);
                        handleSearch();
                    }}
                    placeholder="Тег"
                    className="filter-select"
                />

                <CustomSelect
                    options={genres}
                    value={selectedGenre}
                    onChange={(value) => {
                        setSelectedGenre(value);
                        handleSearch();
                    }}
                    placeholder="Жанр"
                    className="filter-select"
                />

                <CustomSelect
                    options={authors}
                    value={selectedAuthor}
                    onChange={(value) => {
                        setSelectedAuthor(value);
                        handleSearch();
                    }}
                    placeholder="Автор"
                    className="filter-select"
                />

                {hasActiveFilters && (
                    <button className="clear-filters-btn" onClick={handleClearFilters}>
                        <FiX /> Сбросить
                    </button>
                )}
            </div>

            {/* Расширенные фильтры */}
            {showAdvanced && (
                <div className="advanced-filters">
                    <div className="filter-group">
                        <label>Год издания</label>
                        <div className="range-inputs">
                            <input
                                type="number"
                                placeholder="От"
                                value={yearFrom}
                                onChange={(e) => setYearFrom(e.target.value)}
                                onBlur={handleSearch}
                                min="1900"
                                max={new Date().getFullYear()}
                            />
                            <span>—</span>
                            <input
                                type="number"
                                placeholder="До"
                                value={yearTo}
                                onChange={(e) => setYearTo(e.target.value)}
                                onBlur={handleSearch}
                                min="1900"
                                max={new Date().getFullYear()}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Количество страниц</label>
                        <div className="range-inputs">
                            <input
                                type="number"
                                placeholder="От"
                                value={pagesFrom}
                                onChange={(e) => setPagesFrom(e.target.value)}
                                onBlur={handleSearch}
                                min="1"
                            />
                            <span>—</span>
                            <input
                                type="number"
                                placeholder="До"
                                value={pagesTo}
                                onChange={(e) => setPagesTo(e.target.value)}
                                onBlur={handleSearch}
                                min="1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {isListening && (
                <div className="listening-indicator">
                    <div className="pulse-animation"></div>
                    <span>Говорите...</span>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearchFilters;
