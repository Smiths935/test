// src/VideoMeeting.js
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import './VideoMeeting.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { generateToken } from '../components/zegocloudConfig';

const VideoMeeting = () => {
  const { id } = useParams();
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (loading) return; // Ne rien faire tant que la requête est en cours
    if (!user) return; // Ne rien faire si l'utilisateur n'est pas connecté

    const appID = 962735938;
    const serverSecret = '09bdb6913d6ad8144062b7b8f664dad2';

    const initMeeting = async () => {
      const token = await generateToken(user.uid, id);
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, id, user.uid, user.displayName || user.email);

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: document.getElementById('meeting-container'),
        sharedLinks: [
          {
            name: 'Copier le lien',
            url: window.location.href,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        user: {
          name: user.displayName || user.email,
        },
      });
    };

    initMeeting();
  }, [id, user, loading]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;
  if (!user) return <div>Vous devez être connecté pour accéder à cette page.</div>;

  return (
    <div className="video-meeting-container">
      <div id="meeting-container" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default VideoMeeting;
