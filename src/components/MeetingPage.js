import React from 'react';
import './MeetingPage.css';

const MeetingPage = () => {
    return (
        <div className="meeting-page">
            <header>
                <h1>Réunions</h1>
                <button>Nouvelle réunion</button>
            </header>
            <div className="meeting-list">
                <div className="meeting-item">
                    <h2>Réunion 1</h2>
                    <p>Date et heure</p>
                    <button>Rejoindre</button>
                </div>
                <div className="meeting-item">
                    <h2>Réunion 2</h2>
                    <p>Date et heure</p>
                    <button>Rejoindre</button>
                </div>
            </div>
        </div>
    );
};

export default MeetingPage;
