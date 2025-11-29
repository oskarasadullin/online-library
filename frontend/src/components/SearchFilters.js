import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { filtersAPI } from '../services/api';
import '../styles/SearchFilters.css';

const CustomSelect = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(placeholder);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (value === '') {
            setSelectedLabel(placeholder);
        } else {
            const selected = options.find(opt => opt.value === value);
            if (selected) setSelectedLabel(selected.label);
        }
    }, [value, options, placeholder]);

    // Обновляем позицию dropdown при открытии
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                top: `${rect.bottom + 8}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                zIndex: 9999
            });
        }
    }, [isOpen]);

    // Закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Обновление позиции при скролле/resize
    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownStyle({
                    position: 'fixed',
                    top: `${rect.bottom + 8}px`,
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                    zIndex: 9999
                });
            }
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const dropdownContent = isOpen ? (
        <div
            ref={dropdownRef}
            className="custom-select-dropdown"
            style={dropdownStyle}
        >
            <div className="custom-select-dropdown-inner">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                        onClick={() => handleSelect(option.value)}
                    >
                        {option.value === value && <span className="check-mark"></span>}
                        <span className="option-text">{option.label}</span>
                    </div>
                ))}
            </div>
        </div>
    ) : null;

    return (
        <>
            <div className="custom-select-wrapper">
                <button
                    ref={buttonRef}
                    className={`custom-select-button ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                >
                    <span className="custom-select-value">{selectedLabel}</span>
                    <svg
                        className="custom-select-arrow"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                    >
                        <path
                            d="M5 8L10 13L15 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
            {dropdownContent && createPortal(dropdownContent, document.body)}
        </>
    );
};

const SearchFilters = ({ onFilterChange }) => {
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');

    const [tags, setTags] = useState([]);
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        loadFilters();
    }, []);

    useEffect(() => {
        const filters = {
            search: search || undefined,
            tag: selectedTag || undefined,
            genre: selectedGenre || undefined,
            author: selectedAuthor || undefined,
        };
        onFilterChange(filters);
    }, [search, selectedTag, selectedGenre, selectedAuthor]);

    const loadFilters = async () => {
        try {
            const [tagsRes, genresRes, authorsRes] = await Promise.all([
                filtersAPI.getTags(),
                filtersAPI.getGenres(),
                filtersAPI.getAuthors(),
            ]);
            setTags(tagsRes.data.tags);
            setGenres(genresRes.data.genres);
            setAuthors(authorsRes.data.authors);
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    };

    const handleReset = () => {
        setSearch('');
        setSelectedTag('');
        setSelectedGenre('');
        setSelectedAuthor('');
    };

    const tagOptions = [
        { value: '', label: 'Все теги' },
        ...tags.map(tag => ({ value: tag, label: tag }))
    ];

    const genreOptions = [
        { value: '', label: 'Все жанры' },
        ...genres.map(genre => ({ value: genre, label: genre }))
    ];

    const authorOptions = [
        { value: '', label: 'Все авторы' },
        ...authors.map(author => ({ value: author, label: author }))
    ];

    return (
        <div className="search-filters">
            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Поиск книг по названию, автору, описанию..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="filters-row">
                <CustomSelect
                    value={selectedTag}
                    onChange={setSelectedTag}
                    options={tagOptions}
                    placeholder="Все теги"
                />

                <CustomSelect
                    value={selectedGenre}
                    onChange={setSelectedGenre}
                    options={genreOptions}
                    placeholder="Все жанры"
                />

                <CustomSelect
                    value={selectedAuthor}
                    onChange={setSelectedAuthor}
                    options={authorOptions}
                    placeholder="Все авторы"
                />

                <button className="btn-reset" onClick={handleReset}>
                    Сбросить
                </button>
            </div>
        </div>
    );
};

export default SearchFilters;
