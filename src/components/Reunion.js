// src/components/Reunion.js
import React, { useState } from 'react';
import { firestore } from '../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const Reunion = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const createMeeting = async () => {
    const docRef = await addDoc(collection(firestore, 'reunions'), {
      title,
      date
    });
    console.log("Réunion ajoutée avec ID: ", docRef.id);
  };

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la réunion"
      />
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={createMeeting}>Créer une Réunion</button>
    </div>
  );
};

export default Reunion;
