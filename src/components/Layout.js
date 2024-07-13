import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faBars, faTimes, faUser, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import './Home';

const Layout = ({ children }) => {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();
    const [isNavOpen, setIsNavOpen] = useState(false);

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <div className="layout-container">
            <div className={`sidebar ${isNavOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="user-info">
                        <img src={user?.photoURL || "https://via.placeholder.com/50"} alt="User Icon" />
                        <h2>{user?.displayName || user?.email}</h2>
                    </div>
                    <button className="close-btn" onClick={toggleNav}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className="sidebar-menu">
                    <div className="menu-item">
                        <button className="menu-link">
                            <FontAwesomeIcon icon={faCalendarAlt} /> Réunion
                        </button>
                        <div className="submenu">
                            <button onClick={() => navigate('/create-meeting')}>Créer une réunion pour plus tard</button>
                            <button onClick={() => navigate('/start-meeting')}>Démarrer une réunion</button>
                            <button onClick={() => navigate('/schedule-meeting')}>Planifier une réunion</button>
                            <button onClick={() => navigate('/join-meeting')}>Participer à une réunion</button>
                        </div>
                    </div>
                    <div className="menu-item">
                        <button className="menu-link" onClick={() => navigate('/account')}>
                            <FontAwesomeIcon icon={faUser} /> Compte
                        </button>
                    </div>
                </div>
                <div className="sidebar-footer">
                    <button onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} /> Se Déconnecter
                    </button>
                </div>
            </div>
            <div className="content">
                <button className="menu-icon" onClick={toggleNav}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <main>{children}</main>
            </div>
        </div>
    );
};

export default Layout;
