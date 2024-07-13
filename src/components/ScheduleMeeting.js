// src/ScheduleMeeting.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import './ScheduleMeeting.css';

const ScheduleMeeting = () => {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [user] = useAuthState(auth);

    useEffect(() => {
        fetchContacts();
    }, [user]);

    const fetchContacts = async () => {
        if (user) {
            const q = query(collection(db, 'contacts'), where('owner', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const contactsData = [];
            querySnapshot.forEach((doc) => {
                contactsData.push({ id: doc.id, ...doc.data() });
            });
            setContacts(contactsData);
        }
    };

    const handleScheduleMeeting = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!title || !date || !time || !description) {
            setError("Veuillez remplir tous les champs.");
            return;
        }

        const meetingDateTime = new Date(`${date}T${time}`);
        if (meetingDateTime <= new Date()) {
            setError("La date et l'heure doivent être dans le futur.");
            return;
        }

        try {
            const meetingDateTimeTS = Timestamp.fromDate(meetingDateTime);
            const docRef = await addDoc(collection(db, 'meetings'), {
                title,
                description,
                dateTime: meetingDateTimeTS,
                participants: selectedContacts.map(contact => contact.email),
            });

            const link = `${window.location.origin}/video-meeting/${docRef.id}`;
            setMeetingLink(link);
            setSuccess("Réunion planifiée avec succès.");
            setTitle("");
            setDate("");
            setTime("");
            setDescription("");

            // Send invitations to selected contacts and the user
            const notification = {
                type: 'invitation',
                message: `Vous avez été invité à une réunion : ${title} à ${meetingDateTimeTS.toDate().toLocaleString()}`,
                link,
                timestamp: new Date().toISOString(),
            };
            const notificationPromises = selectedContacts.map(contact => {
                const contactDoc = doc(db, 'users', contact.id);
                return updateDoc(contactDoc, {
                    notifications: arrayUnion(notification),
                });
            });

            // Send a notification to the meeting creator
            const creatorNotification = {
                type: 'info',
                message: `Vous avez créé la réunion : ${title} à ${meetingDateTimeTS.toDate().toLocaleString()}`,
                link,
                timestamp: new Date().toISOString(),
            };
            const userDoc = doc(db, 'users', user.uid);
            notificationPromises.push(updateDoc(userDoc, {
                notifications: arrayUnion(creatorNotification),
            }));

            await Promise.all(notificationPromises);
        } catch (error) {
            console.error("Erreur de planification de réunion: ", error);
            setError("Une erreur est survenue lors de la planification de la réunion.");
        }
    };

    const handleContactSelect = (contact) => {
        if (selectedContacts.includes(contact)) {
            setSelectedContacts(selectedContacts.filter(c => c !== contact));
        } else {
            setSelectedContacts([...selectedContacts, contact]);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(meetingLink).then(() => {
            alert("Lien copié dans le presse-papiers");
        }, (err) => {
            console.error("Erreur de copie: ", err);
        });
    };

    return (
        <div className="schedule-meeting-container">
            <form className="schedule-meeting-form" onSubmit={handleScheduleMeeting}>
                <h2>Planifier une Réunion</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <input 
                    type="text" 
                    placeholder="Titre de la réunion" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                />
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                />
                <input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    required 
                />
                <textarea 
                    placeholder="Description de la réunion" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                />
                <button type="submit">Planifier Réunion</button>
            </form>
            <div className="contacts-selection">
                <h3>Sélectionner des contacts à inviter</h3>
                <ul>
                    {contacts.map((contact, index) => (
                        <li key={index}>
                            <input 
                                type="checkbox" 
                                checked={selectedContacts.includes(contact)} 
                                onChange={() => handleContactSelect(contact)} 
                            />
                            {contact.name} - {contact.email}
                        </li>
                    ))}
                </ul>
            </div>
            {meetingLink && (
                <div className="popup">
                    <p>Lien de la réunion : <a href={meetingLink} target="_blank" rel="noopener noreferrer">{meetingLink}</a></p>
                    <button onClick={copyToClipboard}>Copier le lien</button>
                </div>
            )}
        </div>
    );
};

export default ScheduleMeeting;
