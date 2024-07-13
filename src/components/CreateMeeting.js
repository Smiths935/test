// src/CreateMeeting.js
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import './CreateMeeting.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';

const CreateMeeting = () => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    const currentDateTime = Timestamp.now();

    try {
      const docRef = await addDoc(collection(db, "meetings"), {
        title,
        dateHeure: currentDateTime,
        participants: [],
      });

      const meetingId = docRef.id;
      const meetingLink = `${window.location.origin}/video-meeting/${meetingId}`;

      // Create a new notification with the current date and time
      await addDoc(collection(db, 'notifications'), {
        recipient: user.email,
        message: `Vous avez créé la réunion "${title}" à ${currentDateTime.toDate().toLocaleString()}`,
        link: `/video-meeting/${meetingId}`,
        read: false,
        timestamp: currentDateTime,
      });

      setSuccess(`Réunion créée avec succès à ${currentDateTime.toDate().toLocaleString()}. Lien: ${meetingLink}`);
      navigate(`/video-meeting/${meetingId}`);
    } catch (error) {
      console.error("Erreur de création de réunion: ", error);
      setError("Une erreur est survenue lors de la création de la réunion.");
    }
  };

  return (
    <div className="meeting-container">
      <form className="meeting-form" onSubmit={handleCreateMeeting}>
        <h2>Créer une Réunion</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <input 
          type="text" 
          placeholder="Titre de la réunion" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <button type="submit">Créer Réunion</button>
      </form>
    </div>
  );
};

export default CreateMeeting;
