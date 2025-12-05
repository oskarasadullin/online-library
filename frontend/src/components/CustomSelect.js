import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import '../styles/CustomSelect.css';

const CustomSelect = ({ options, value, onChange, placeholder, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    const displayValue = value || placeholder;
    const isPlaceholder = !value;

    return (
        <div ref={selectRef} className={`custom-select ${className} ${isOpen ? 'open' : ''}`}>
            <button
                type="button"
                className={`select-trigger ${isPlaceholder ? 'placeholder' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="select-value">{displayValue}</span>
                <FiChevronDown className={`select-arrow ${isOpen ? 'rotate' : ''}`} />
            </button>

            {isOpen && (
                <div className="select-dropdown">
                    {placeholder && (
                        <div
                            className="select-option placeholder-option"
                            onClick={() => handleSelect('')}
                        >
                            {placeholder}
                        </div>
                    )}
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`select-option ${value === option ? 'selected' : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
