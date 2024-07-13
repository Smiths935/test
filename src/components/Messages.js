// src/components/Messages.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faMicrophone, faPaperPlane, faPhone, faVideo, faPlus } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import Users from './Users';
import GroupCreationModal from './GroupCreationModal';
import './Messages.css';

const socket = io('http://localhost:4000');

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [user, loading, error] = useAuthState(auth);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isGroup, setIsGroup] = useState(false);
    const [groups, setGroups] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const myVideoRef = useRef();
    const userVideoRef = useRef();
    const [peer, setPeer] = useState(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        if (loading) return;
        if (!user) return;

        socket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        fetchGroups();

        return () => {
            socket.off('receiveMessage');
        };
    }, [user, loading]);

    const fetchGroups = async () => {
        const q = query(collection(db, 'groups'), where('members', 'array-contains', user.email));
        const querySnapshot = await getDocs(q);
        const groupsData = [];
        querySnapshot.forEach((doc) => {
            groupsData.push({ id: doc.id, ...doc.data() });
        });
        setGroups(groupsData);
    };

    const handleSendMessage = async (text, fileUrl, audioUrl) => {
        if (!text && !fileUrl && !audioUrl) return;

        if (!user) {
            console.error('Utilisateur non authentifié');
            return;
        }

        const messageData = {
            text,
            user: user.email,
            fileUrl,
            audioUrl,
            timestamp: Timestamp.now(),
            to: selectedUser,
            isGroup,
        };

        socket.emit('sendMessage', messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
    };

    const startCall = async (type) => {
        if (!user) {
            console.error('Utilisateur non authentifié');
            return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
        setStream(mediaStream);

        const newPeer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: mediaStream
        });

        newPeer.on('signal', data => {
            socket.emit('offer', { data, to: selectedUser });
        });

        newPeer.on('stream', stream => {
            userVideoRef.current.srcObject = stream;
        });

        setPeer(newPeer);
    };

    const handleIncomingCall = async (offer) => {
        if (!user) {
            console.error('Utilisateur non authentifié');
            return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);

        const newPeer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: mediaStream
        });

        newPeer.signal(offer);

        newPeer.on('signal', data => {
            socket.emit('answer', { data, to: selectedUser });
        });

        newPeer.on('stream', stream => {
            userVideoRef.current.srcObject = stream;
        });

        setPeer(newPeer);
    };

    useEffect(() => {
        socket.on('offer', (offer) => {
            handleIncomingCall(offer.data);
        });

        socket.on('answer', (answer) => {
            if (peer) {
                peer.signal(answer.data);
            }
        });

        return () => {
            socket.off('offer');
            socket.off('answer');
        };
    }, [peer]);

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>Erreur : {error.message}</div>;
    if (!user) return <div>Veuillez vous connecter pour voir les messages.</div>;

    return (
        <div className="root">
            <div className="sidebar">
                <Users onSelectUser={(user) => { setSelectedUser(user); setIsGroup(false); }} />
                <h3>Groupes</h3>
                <ul>
                    {groups.map((group) => (
                        <li key={group.id} onClick={() => { setSelectedUser(group.id); setIsGroup(true); }}>{group.name}</li>
                    ))}
                </ul>
                <button className="create-group-button" onClick={() => setModalOpen(true)}>
                    <FontAwesomeIcon icon={faPlus} /> Créer un groupe
                </button>
            </div>
            <div className="chatArea">
                <div className="chatHeader">
                    <h2>{selectedUser ? `Discuter avec ${selectedUser}` : 'Sélectionnez un contact ou un groupe pour commencer à discuter'}</h2>
                    {selectedUser && !isGroup && (
                        <div className="headerIcons">
                            <button onClick={() => startCall('audio')}><FontAwesomeIcon icon={faPhone} /></button>
                            <button onClick={() => startCall('video')}><FontAwesomeIcon icon={faVideo} /></button>
                        </div>
                    )}
                </div>
                <div className="messageList">
                    {messages.filter((message) => message.to === selectedUser && message.isGroup === isGroup).map((message) => (
                        <div key={message.timestamp.toMillis()} className={`messageItem ${message.user === user.email ? 'self' : ''}`}>
                            <span className="chat-user">{message.user}</span>
                            <p>{message.text}</p>
                            {message.fileUrl && <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">Voir le fichier</a>}
                            {message.audioUrl && <audio controls src={message.audioUrl} />}
                        </div>
                    ))}
                </div>
                {selectedUser && (
                    <div className="messageInputContainer">
                        <MessageInput onSendMessage={handleSendMessage} />
                    </div>
                )}
            </div>
            <GroupCreationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                user={user}
                fetchGroups={fetchGroups}
            />
        </div>
    );
};

const MessageInput = ({ onSendMessage }) => {
    const [text, setText] = useState('');
    const fileInputRef = useRef();
    const audioInputRef = useRef();

    const handleSend = (e) => {
        e.preventDefault();
        onSendMessage(text, null, null);
        setText('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Handle file upload and send message with file URL
            // Example: handleSendMessage(null, fileUrl, null);
        }
        e.target.value = null;
    };

    const handleAudioChange = (e) => {
        const audio = e.target.files[0];
        if (audio) {
            // Handle audio upload and send message with audio URL
            // Example: handleSendMessage(null, null, audioUrl);
        }
        e.target.value = null;
    };

    return (
        <form className="messageInput" onSubmit={handleSend}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tapez un message..."
                className="inputInput"
            />
            <label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                />
                <FontAwesomeIcon icon={faPaperclip} />
            </label>
            <label>
                <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    ref={audioInputRef}
                    style={{ display: 'none' }}
                />
                <FontAwesomeIcon icon={faMicrophone} />
            </label>
            <button type="submit"><FontAwesomeIcon icon={faPaperPlane} /></button>
        </form>
    );
};

MessageInput.propTypes = {
    onSendMessage: PropTypes.func.isRequired,
};

export default Messages;
