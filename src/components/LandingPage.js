// src/components/LandingPage.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LandingPage.css';
import slide1 from'../assets/create_meeting.jpg';
import slide2 from'../assets/slide2.jpg';
import slide3 from'../assets/slide3.jpg';
import slide4 from'../assets/slide4.jpg';
import slide5 from'../assets/slide5.jpg';

const slidesData = [
    {
        image: slide1,
        title: "Créer une Réunion",
        description: "Organisez vos réunions en un clin d'œil grâce à notre interface intuitive. Créez des réunions en quelques clics et invitez vos participants rapidement."
    },
    {
        image: slide2,
        title: "Planifier une Réunion",
        description: "Planifiez vos réunions à l'avance avec notre outil de planification facile à utiliser. Envoyez des invitations automatiques et gérez les réponses en toute simplicité."
    },
    {
        image: slide3,
        title: "Appels Vidéo et Audio",
        description: "Profitez d'appels vidéo et audio de haute qualité pour rester connecté avec vos équipes, où que vous soyez. Communiquez efficacement sans interruptions."
    },
    {
        image: slide4,
        title: "Partage d'Écran",
        description: "Partagez votre écran en un clic pour des présentations et des démonstrations claires et efficaces. Collaborez en temps réel avec vos collègues."
    },
    {
        image: slide5,
        title: "Enregistrements",
        description: "Enregistrez vos réunions pour les revoir plus tard. Ne manquez jamais un détail important et partagez facilement les enregistrements avec vos équipes."
    }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const slidesRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const autoScroll = () => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slidesData.length);
        };

        const intervalId = setInterval(autoScroll, 10000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const slides = slidesRef.current.children;
        slides[currentIndex].scrollIntoView({ behavior: 'smooth' });
    }, [currentIndex]);

    const handleNavigation = (direction) => {
        setCurrentIndex((prevIndex) => {
            if (direction === 'left') {
                return (prevIndex - 1 + slidesData.length) % slidesData.length;
            }
            if (direction === 'right') {
                return (prevIndex + 1) % slidesData.length;
            }
        });
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="landing-container">
            <section className="slides-container" ref={slidesRef}>
                {slidesData.map((slide, index) => (
                    <div className="slide" key={index} style={{ backgroundImage: `url(${slide.image})` }}>
                        <div className="slide-content">
                            <h2>{slide.title}</h2>
                            <p>{slide.description}</p>
                            <button className="landing-button" onClick={handleLogin}>Se Connecter</button>
                        </div>
                    </div>
                ))}
            </section>
            <div className="pagination">
                {slidesData.map((_, index) => (
                    <div
                        key={index}
                        className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    ></div>
                ))}
            </div>
            <div className="navigation">
                <button className="nav-button left" onClick={() => handleNavigation('left')}>{'<'}</button>
                <button className="nav-button right" onClick={() => handleNavigation('right')}>{'>'}</button>
            </div>
            <footer className="landing-footer">
                <p>&copy; 2024 Gestion Réunion. Tous droits réservés.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
