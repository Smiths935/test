// src/NavBar.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser, faCalendarAlt, faPhone, faChevronDown, faBell, faEnvelope, faAddressBook, faHistory } from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import './NavBar.css';
import logo from '../../public/logo.png';

const NavBar = ({ activePage, setActivePage, dateTime }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isSubMenuOpen, setIsSubMenuOpen] = useState({
    reunion: false,
    nouvelleReunion: false,
    user: false,
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
    }
  }, [user]);

  const fetchUnreadNotifications = async () => {
    const q = query(collection(db, 'notifications'), where('recipient', '==', user.email), where('read', '==', false));
    const querySnapshot = await getDocs(q);
    setUnreadCount(querySnapshot.size);
  };

  const handleCreateMeeting = () => {
    setActivePage('create-meeting');
    navigate('/create-meeting');
  };

  const handleJoinMeeting = () => {
    setActivePage('join-meeting');
    navigate('/join-meeting');
  };

  const handleContact = () => {
    setActivePage('contacts');
    navigate('/contacts');
  };

  const handleScheduleMeeting = () => {
    setActivePage('schedule-meeting');
    navigate('/schedule-meeting');
  };

  const handleHistory = () => {
    setActivePage('history');
    navigate('/history');
  };

  const handleMessages = () => {
    setActivePage('Messages');
    navigate(`/Messages/${user.email}`);
  };

  const handleNotifications = () => {
    setActivePage('notifications');
    navigate('/notifications');
  };

  const handleProfile = () => {
    setActivePage('profile');
    navigate('/profile');
  };

  const handleCalls = () => {
    setActivePage('calls');
    navigate('/calls');
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const toggleSubMenu = (menu) => {
    setIsSubMenuOpen(prevState => ({
      ...prevState,
      [menu]: !prevState[menu]
    }));
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <div className="nav-logo">
          <h1>W</h1>
          <h4>e</h4>
          <h1>M</h1>
          <h4>eet</h4>
        </div>
        <div className="nav-item">
          <button className={`nav-link ${activePage === 'reunion' ? 'active' : ''}`} onClick={() => toggleSubMenu('reunion')}>
            <FontAwesomeIcon icon={faCalendarAlt} /> Réunion
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
          {isSubMenuOpen.reunion && (
            <div className="submenu">
              <button onClick={() => toggleSubMenu('nouvelleReunion')}>
                Nouvelle réunion
                <FontAwesomeIcon icon={faChevronDown} style={{ marginLeft: "5px" }} />
              </button>
              {isSubMenuOpen.nouvelleReunion && (
                <div className="subsubmenu">
                  <button onClick={handleCreateMeeting}>Créer une réunion</button>
                  <button onClick={handleScheduleMeeting}>Planifier une réunion</button>
                </div>
              )}
              <button onClick={handleJoinMeeting}>Participer à une réunion</button>
            </div>
          )}
        </div>
        <div className="nav-item">
          <button className={`nav-link ${activePage === 'calls' ? 'active' : ''}`} onClick={handleCalls}>
            <FontAwesomeIcon icon={faPhone} /> Appels
          </button>
        </div>
        <div className="nav-item">
          <button className={`nav-link ${activePage === 'contacts' ? 'active' : ''}`} onClick={handleContact}>
            <FontAwesomeIcon icon={faAddressBook} /> Contacts
          </button>
        </div>
        <div className="nav-item">
          <button className={`nav-link ${activePage === 'history' ? 'active' : ''}`} onClick={handleHistory}>
            <FontAwesomeIcon icon={faHistory} /> Historique
          </button>
        </div>
      </div>
      <div className="nav-date-time">
        {dateTime ? `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString()}` : ''}
      </div>
      <div className="nav-right">
        <FontAwesomeIcon icon={faEnvelope} className="icon" onClick={handleMessages} />
        <div className="notification-icon">
          <FontAwesomeIcon icon={faBell} className="icon" onClick={handleNotifications} />
          {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
        </div>
        <div className="user-menu">
          <button className="user-link" onClick={() => toggleSubMenu('user')}>
            <FontAwesomeIcon icon={faUser} /> {user?.displayName || user?.email.split('@')[0]}
          </button>
          {isSubMenuOpen.user && (
            <div className="user-submenu">
              <button onClick={handleProfile}>Mon profil</button>
              <button onClick={handleContact}>Contact</button>
              <button onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Se Déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

NavBar.propTypes = {
  activePage: PropTypes.string.isRequired,
  setActivePage: PropTypes.func.isRequired,
  dateTime: PropTypes.instanceOf(Date).isRequired,
};

export default NavBar;
