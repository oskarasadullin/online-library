import React from 'react';
import Iridescence from '../../components/Iridescence';
import '../../styles/DocumentsPage.css';

const DocumentsPage = () => {
    return (
        <div className="documents-page">
            {/* Hero Section */}
            <div className="documents-hero">
                <Iridescence
                    color={[0.4, 0.49, 0.92]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={0.5}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Документы и<br />нормативно-<br />правовая база
                        </h1>
                        <p className="hero-subtitle">
                            Актуальная информация о деятельности<br />
                            детского движения
                        </p>
                    </div>

                    <div className="hero-image">
                        <div className="hero-illustration-documents">
                            <div className="folder-stack">
                                <div className="folder folder-1">📁</div>
                                <div className="folder folder-2">📁</div>
                                <div className="folder folder-3">📄</div>
                            </div>
                            <div className="floating-element element-1">📋</div>
                            <div className="floating-element element-2">✓</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="documents-content">
                <div className="content-placeholder">
                    <p className="placeholder-text">Документы скоро появятся</p>
                </div>
            </div>
        </div>
    );
};

export default DocumentsPage;
