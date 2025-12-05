import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/StaggeredMenu.css';
import pioneerLogoLight from '../assets/pioneer-logo-light.png';
import pioneerLogoDark from '../assets/pioneer-logo-dark.png';

export const StaggeredMenu = ({
    position = 'right',
    colors = ['#667eea', '#764ba2'],
    className,
    logoText = 'Библиотека',
    accentColor = '#667eea',
    closeOnClickAway = true
}) => {
    const { isAuthenticated, isAdmin, logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);
    const openRef = useRef(false);
    const panelRef = useRef(null);
    const preLayersRef = useRef(null);
    const preLayerElsRef = useRef([]);
    const plusHRef = useRef(null);
    const plusVRef = useRef(null);
    const iconRef = useRef(null);
    const textInnerRef = useRef(null);
    const [textLines, setTextLines] = useState(['Меню', 'Закрыть']);
    const toggleBtnRef = useRef(null);
    const busyRef = useRef(false);

    const openTlRef = useRef(null);
    const closeTweenRef = useRef(null);
    const spinTweenRef = useRef(null);
    const textCycleAnimRef = useRef(null);

    const currentLogo = theme === 'dark' ? pioneerLogoDark : pioneerLogoLight;

    const sectionsItems = [
        { label: 'Методклуб', link: '/sections/methodclub' },
        { label: 'Пионерская работа', link: '/sections/pioneers' },
        { label: 'Школьный актив', link: '/sections/leaders' },
        { label: 'Волонтёры', link: '/sections/volunteers' },
        { label: 'Школьные медиа', link: '/sections/media' },
        { label: 'Игры', link: '/sections/games' },
        { label: 'Сценарии', link: '/sections/scenarios' },
        { label: 'Пионерская книга', link: '/sections/book' },
        { label: 'Обмен опытом', link: '/sections/exchange' },
        { label: 'Контакты', link: '/sections/contacts' },
        { label: 'Календарь', link: '/sections/calendar' },
        { label: 'Документы', link: '/sections/documents' }
    ];

    const menuItems = [
        { label: 'Главная', link: '/', show: true },
        { label: 'Книги', link: '/books', show: true },
        {
            label: 'Разделы',
            link: '/sections/methodclub',
            show: isAuthenticated,
            hasSubmenu: true,
            submenu: sectionsItems
        },
        { label: 'Избранное', link: '/favorites', show: isAuthenticated },
        { label: 'Админ', link: '/admin', show: isAdmin }
    ].filter(item => item.show);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const panel = panelRef.current;
            const preContainer = preLayersRef.current;
            const plusH = plusHRef.current;
            const plusV = plusVRef.current;
            const icon = iconRef.current;
            const textInner = textInnerRef.current;
            if (!panel || !plusH || !plusV || !icon || !textInner) return;

            let preLayers = [];
            if (preContainer) {
                preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
            }
            preLayerElsRef.current = preLayers;

            const offscreen = position === 'left' ? -100 : 100;
            gsap.set([panel, ...preLayers], { xPercent: offscreen });
            gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
            gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
            gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
            gsap.set(textInner, { yPercent: 0 });
        });
        return () => ctx.revert();
    }, [position]);

    const buildOpenTimeline = useCallback(() => {
        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return null;

        openTlRef.current?.kill();
        closeTweenRef.current?.kill();

        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));

        const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
        const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

        if (itemEls.length) {
            gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }

        const tl = gsap.timeline({ paused: true });

        layerStates.forEach((ls, i) => {
            tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
        });

        const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
        const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
        const panelDuration = 0.65;
        tl.fromTo(panel, { xPercent: panelStart }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime);

        if (itemEls.length) {
            const itemsStartRatio = 0.15;
            const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
            tl.to(itemEls, {
                yPercent: 0,
                rotate: 0,
                duration: 1,
                ease: 'power4.out',
                stagger: { each: 0.1, from: 'start' }
            }, itemsStart);
        }

        openTlRef.current = tl;
        return tl;
    }, []);

    const playOpen = useCallback(() => {
        if (busyRef.current) return;
        busyRef.current = true;
        const tl = buildOpenTimeline();
        if (tl) {
            tl.eventCallback('onComplete', () => {
                busyRef.current = false;
            });
            tl.play(0);
        } else {
            busyRef.current = false;
        }
    }, [buildOpenTimeline]);

    const playClose = useCallback(() => {
        openTlRef.current?.kill();
        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return;

        const all = [...layers, panel];
        closeTweenRef.current?.kill();
        const offscreen = position === 'left' ? -100 : 100;
        closeTweenRef.current = gsap.to(all, {
            xPercent: offscreen,
            duration: 0.32,
            ease: 'power3.in',
            overwrite: 'auto',
            onComplete: () => {
                const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
                if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
                busyRef.current = false;
            }
        });
    }, [position]);

    const animateIcon = useCallback(opening => {
        const icon = iconRef.current;
        if (!icon) return;
        spinTweenRef.current?.kill();
        if (opening) {
            spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
        } else {
            spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
        }
    }, []);

    const animateText = useCallback(opening => {
        const inner = textInnerRef.current;
        if (!inner) return;
        textCycleAnimRef.current?.kill();

        const currentLabel = opening ? 'Меню' : 'Закрыть';
        const targetLabel = opening ? 'Закрыть' : 'Меню';
        const cycles = 3;
        const seq = [currentLabel];
        let last = currentLabel;
        for (let i = 0; i < cycles; i++) {
            last = last === 'Меню' ? 'Закрыть' : 'Меню';
            seq.push(last);
        }
        if (last !== targetLabel) seq.push(targetLabel);
        seq.push(targetLabel);
        setTextLines(seq);

        gsap.set(inner, { yPercent: 0 });
        const lineCount = seq.length;
        const finalShift = ((lineCount - 1) / lineCount) * 100;
        textCycleAnimRef.current = gsap.to(inner, {
            yPercent: -finalShift,
            duration: 0.5 + lineCount * 0.07,
            ease: 'power4.out'
        });
    }, []);

    const toggleMenu = useCallback(() => {
        const target = !openRef.current;
        openRef.current = target;
        setOpen(target);
        if (target) {
            playOpen();
        } else {
            playClose();
            setExpandedSection(null);
        }
        animateIcon(target);
        animateText(target);
    }, [playOpen, playClose, animateIcon, animateText]);

    const closeMenu = useCallback(() => {
        if (openRef.current) {
            openRef.current = false;
            setOpen(false);
            setExpandedSection(null);
            playClose();
            animateIcon(false);
            animateText(false);
        }
    }, [playClose, animateIcon, animateText]);

    React.useEffect(() => {
        if (!closeOnClickAway || !open) return;
        const handleClickOutside = event => {
            if (panelRef.current && !panelRef.current.contains(event.target) && !toggleBtnRef.current?.contains(event.target)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeOnClickAway, open, closeMenu]);

    const handleLogout = () => {
        logout();
        closeMenu();
    };

    const toggleSubmenu = (index) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    return (
        <>
            {/* Header вынесен за пределы wrapper */}
            <header className="staggered-menu-header">
                <Link to="/" className="sm-logo">
                    <span className="sm-logo-text">{logoText}</span>
                    <img src={currentLogo} alt="Пионеры Башкортостана" className="sm-logo-icon" />
                </Link>
                <button
                    ref={toggleBtnRef}
                    className="sm-toggle"
                    aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
                    aria-expanded={open}
                    onClick={toggleMenu}
                    type="button"
                >
                    <span className="sm-toggle-textWrap">
                        <span ref={textInnerRef} className="sm-toggle-textInner">
                            {textLines.map((l, i) => (
                                <span className="sm-toggle-line" key={i}>{l}</span>
                            ))}
                        </span>
                    </span>
                    <span ref={iconRef} className="sm-icon">
                        <span ref={plusHRef} className="sm-icon-line" />
                        <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
                    </span>
                </button>
            </header>

            <div
                className={(className ? className + ' ' : '') + 'staggered-menu-wrapper fixed-wrapper'}
                style={{ '--sm-accent': accentColor }}
                data-position={position}
                data-open={open || undefined}
            >
                <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
                    {colors.slice(0, 2).map((c, i) => (
                        <div key={i} className="sm-prelayer" style={{ background: c }} />
                    ))}
                </div>

                <aside ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
                    <div className="sm-panel-inner">
                        <ul className="sm-panel-list" role="list">
                            {menuItems.map((item, idx) => (
                                <li className="sm-panel-itemWrap" key={item.label + idx}>
                                    {item.hasSubmenu ? (
                                        <div className="sm-submenu-wrapper">
                                            <button
                                                className={`sm-panel-item submenu-toggle ${expandedSection === idx ? 'expanded' : ''}`}
                                                onClick={() => toggleSubmenu(idx)}
                                            >
                                                <span className="sm-panel-itemLabel">{item.label}</span>
                                            </button>
                                            <ul className={`sm-submenu ${expandedSection === idx ? 'expanded' : ''}`}>
                                                {item.submenu.map((subItem, subIdx) => (
                                                    <li key={subIdx} className="sm-submenu-item">
                                                        <Link
                                                            to={subItem.link}
                                                            className={`sm-submenu-link ${location.pathname === subItem.link ? 'active' : ''}`}
                                                            onClick={closeMenu}
                                                        >
                                                            <span className="sm-submenu-label">{subItem.label}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <Link
                                            className={`sm-panel-item ${location.pathname === item.link || location.pathname.startsWith(item.link + '/') ? 'active' : ''}`}
                                            to={item.link}
                                            onClick={closeMenu}
                                        >
                                            <span className="sm-panel-itemLabel">{item.label}</span>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="sm-user-section">
                            {isAuthenticated && user && (
                                <div className="sm-user-info">
                                    <div className="sm-user-avatar">{user.fullname?.charAt(0).toUpperCase() || 'U'}</div>
                                    <span className="sm-user-name">{user.fullname || 'Пользователь'}</span>
                                </div>
                            )}

                            <div className="sm-actions">
                                <button className="sm-theme-btn" onClick={toggleTheme}>
                                    <span className="sm-theme-icon">{theme === 'light' ? '' : ''}</span>
                                    <span className="sm-theme-text">{theme === 'light' ? 'Темная тема' : 'Светлая тема'}</span>
                                </button>

                                {isAuthenticated ? (
                                    <button className="sm-auth-btn logout" onClick={handleLogout}>
                                        Выйти
                                    </button>
                                ) : (
                                    <Link to="/auth" className="sm-auth-btn login" onClick={closeMenu}>
                                        Войти
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default StaggeredMenu;
