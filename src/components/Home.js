import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import './Home.css';
import illustration from '../assets/VOTE.jpg';

const Home = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [activePage, setActivePage] = useState('home');
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCreateMeeting = () => {
        setActivePage('create-meeting');
        navigate('/create-meeting');
    };

    const handleJoinMeeting = () => {
        setActivePage('join-meeting');
        navigate('/join-meeting');
    };

    return (
        <div className="home-container">
            <NavBar activePage={activePage} setActivePage={setActivePage} dateTime={dateTime} />
            <header className="header">
                <div className="header-content">
                    <h1>Appels vidéo et visioconférences pour tous</h1>
                </div>
            </header>
            <main className="main-content">
                <div className="illustration-container">
                    <img src={illustration} />
                    <p>Communiquez, collaborez et célébrez les bons moments où que vous soyez avec Gestion Réunion</p>
                </div>
                <div className="actions-container">
                    <button className="action-button primary" onClick={handleCreateMeeting}>Nouvelle réunion</button>
                    <button className="action-button secondary" onClick={handleJoinMeeting}>Participer</button>
                </div>
            </main>
        </div>
    );
};

export default Home;
