// src/JoinMeetingLink.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { collection, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import './JoinMeetingLink.css';
import { generateToken } from '../components/zegocloudConfig';

const JoinMeetingLink = () => {
  const [meetingLink, setMeetingLink] = useState("");
  const [error, setError] = useState("");
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleJoinMeeting = async () => {
    setError("");
    if (meetingLink) {
      const meetingId = meetingLink.split('/').pop();

      // Configuration de l'application ZEGOCLOUD
      const appID = 962735938; // Votre appID
      const serverSecret = '09bdb6913d6ad8144062b7b8f664dad2'; // Votre secret serveur
      const userID = user ? user.uid : `user_${Math.floor(Math.random() * 10000)}`;
      const userName = user ? (user.displayName || user.email) : `User ${Math.floor(Math.random() * 10000)}`;

      const token = await generateToken(userID, meetingId);

      // Création et configuration du kit ZegoUIKitPrebuilt
      const zp = ZegoUIKitPrebuilt.create(token);
      zp.joinRoom({
        container: document.getElementById('meeting-container'),
        sharedLinks: [
          {
            name: 'Copier le lien',
            url: window.location.href,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall, // Mode d'appel de groupe
        },
        user: {
          name: userName,
        },
      });

      // Create a new notification
      await addDoc(collection(db, 'notifications'), {
        recipient: user.email,
        message: `Vous avez rejoint la réunion ${meetingId}`,
        link: `/video-meeting/${meetingId}`,
        read: false,
        timestamp: new Date(),
      });

      // Add user to the meeting's participants array
      const meetingDoc = doc(db, 'meetings', meetingId);
      await updateDoc(meetingDoc, {
        participants: arrayUnion(user.email)
      });

      navigate(`/video-meeting/${meetingId}`);
    } else {
      setError("Veuillez entrer un lien de réunion valide.");
    }
  };

  return (
    <div className="join-meeting-container">
      <h2>Participer à une Réunion</h2>
      {error && <p className="error-message">{error}</p>}
      <input 
        type="text" 
        value={meetingLink} 
        onChange={(e) => setMeetingLink(e.target.value)} 
        placeholder="Entrez le lien de la réunion" 
        required 
      />
      <button onClick={handleJoinMeeting}>Rejoindre</button>
      <div id="meeting-container" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default JoinMeetingLink;
