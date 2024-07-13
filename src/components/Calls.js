// src/Calls.js
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneAlt, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Calls.css';

const Calls = () => {
    const [contacts, setContacts] = useState([]);
    const [callHistory, setCallHistory] = useState([]);
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!user) return navigate('/login');
        fetchContacts();
        fetchCallHistory();
    }, [user, loading]);

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

    const fetchCallHistory = async () => {
        if (user) {
            const q = query(collection(db, 'callHistory'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const historyData = [];
            querySnapshot.forEach((doc) => {
                historyData.push({ id: doc.id, ...doc.data() });
            });
            setCallHistory(historyData);
        }
    };

    const handleCall = async (contact) => {
        if (user) {
            const callDetails = {
                userId: user.uid,
                contactName: contact.name,
                contactEmail: contact.email,
                timestamp: Timestamp.now(),
                type: 'audio',
            };
            await addDoc(collection(db, 'callHistory'), callDetails);

            // Notify the contact about the call
            const contactDoc = doc(db, 'users', contact.email);
            await updateDoc(contactDoc, {
                notification: {
                    type: 'call',
                    message: `Appel audio de ${user.displayName || user.email.split('@')[0]}`,
                    timestamp: Timestamp.now()
                }
            });

            const appID = 962735938; // Votre appID
            const serverSecret = '09bdb6913d6ad8144062b7b8f664dad2'; // Votre secret serveur
            const userID = user.uid;
            const userName = user.displayName || user.email;

            const generateToken = (appID, userID, serverSecret) => {
                const payload = {
                    app_id: appID,
                    user_id: userID,
                    nonce: Math.floor(Math.random() * 1000000),
                    expire_at: Math.floor(Date.now() / 1000) + 3600,
                };
                return require('jwt-simple').encode(payload, serverSecret, 'HS256');
            };

            const token = generateToken(appID, userID, serverSecret);

            const zp = ZegoUIKitPrebuilt.create(token);
            zp.joinRoom({
                container: document.getElementById('call-container'),
                sharedLinks: [
                    {
                        name: 'Copier le lien',
                        url: window.location.href,
                    },
                ],
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall, // Mode d'appel 1-1
                },
                user: {
                    name: userName,
                },
            });

            toast.success(`Appel audio avec ${contact.name}`);
            fetchCallHistory(); // Refresh call history
        }
    };

    return (
        <div className="calls-container">
            <h2>Appels Audio</h2>
            <div className="contacts-list">
                <h3>Contacts</h3>
                <ul>
                    {contacts.map((contact) => (
                        <li key={contact.id}>
                            <span>{contact.name}</span>
                            <span className={`status ${contact.isOnline ? 'online' : 'offline'}`}>
                                <FontAwesomeIcon icon={contact.isOnline ? faCheckCircle : faTimesCircle} />
                            </span>
                            <button onClick={() => handleCall(contact)}>
                                <FontAwesomeIcon icon={faPhoneAlt} /> Appeler
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div id="call-container" className="call-container"></div>
            <div className="call-history">
                <h3>Historique des Appels</h3>
                <ul>
                    {callHistory.map((call) => (
                        <li key={call.id}>
                            {call.contactName} - {new Date(call.timestamp.toDate()).toLocaleString()} - {call.type}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Calls;
