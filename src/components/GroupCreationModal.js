// src/components/GroupCreationModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './GroupCreationModal.css';

const GroupCreationModal = ({ isOpen, onClose, user, fetchGroups }) => {
    const [groupName, setGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        }
    }, [isOpen]);

    const fetchContacts = async () => {
        const q = query(collection(db, 'contacts'), where('owner', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const contactsData = [];
        querySnapshot.forEach((doc) => {
            contactsData.push({ id: doc.id, ...doc.data() });
        });
        setContacts(contactsData);
    };

    const handleGroupMemberSelect = (contact) => {
        if (groupMembers.includes(contact.email)) {
            setGroupMembers(groupMembers.filter((email) => email !== contact.email));
        } else {
            setGroupMembers([...groupMembers, contact.email]);
        }
    };

    const createGroup = async () => {
        if (!groupName || groupMembers.length === 0) {
            alert('Veuillez entrer un nom de groupe et sélectionner des membres.');
            return;
        }

        const groupData = {
            name: groupName,
            members: [...groupMembers, user.email],
            createdAt: Timestamp.now(),
        };

        await addDoc(collection(db, 'groups'), groupData);
        fetchGroups();
        onClose();
    };

    return isOpen ? (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Créer un groupe</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Nom du groupe"
                        required
                    />
                    <table className="contacts-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Sélectionner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.email}>
                                    <td>{contact.name}</td>
                                    <td>{contact.email}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={groupMembers.includes(contact.email)}
                                            onChange={() => handleGroupMemberSelect(contact)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="modal-footer">
                    <button className="create-button" onClick={createGroup}>Créer le groupe</button>
                </div>
            </div>
        </div>
    ) : null;
};

GroupCreationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    fetchGroups: PropTypes.func.isRequired,
};

export default GroupCreationModal;
