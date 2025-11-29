import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-left">
                    <span className="footer-copyright">© 2024 РДОО "ПБ"</span>
                </div>

                <div className="footer-center">
                    <a
                        href="/privacy"
                        className="footer-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Политика в отношении обработки персональных данных
                    </a>
                </div>

                <div className="footer-right">
                    <button
                        onClick={scrollToTop}
                        className="footer-scroll-top"
                        aria-label="Scroll to top"
                    >
                        Вверх ↑
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
