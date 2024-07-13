import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { db, auth } from '../firebaseConfig';
import './Contact.css';

const Contact = () => {
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (searchTerm.trim()) {
            handleSearch();
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchContacts();
        fetchNotifications();
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

    const fetchNotifications = async () => {
        if (user) {
            const q = query(collection(db, 'users'), where('email', '==', user.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                setNotifications(userData.notifications || []);
            } else {
                setNotifications([]);  // Ensure notifications is set to an empty array if no data is found
            }
        }
    };

    const handleSearch = async () => {
        const nameQuery = query(collection(db, 'users'), where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
        const emailQuery = query(collection(db, 'users'), where('email', '>=', searchTerm), where('email', '<=', searchTerm + '\uf8ff'));
        
        const [nameSnapshot, emailSnapshot] = await Promise.all([getDocs(nameQuery), getDocs(emailQuery)]);
        
        const results = [];
        nameSnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });
        emailSnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });

        // Remove duplicates based on email
        const uniqueResults = results.reduce((acc, current) => {
            const x = acc.find(item => item.email === current.email);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        setSearchResults(uniqueResults);
    };

    const handleAddContact = async (user) => {
        if (user.email === auth.currentUser.email) {
            alert('Vous ne pouvez pas ajouter votre propre adresse email.');
            return;
        }
        const contactExists = contacts.some(contact => contact.email === user.email);
        if (contactExists) {
            alert('Le contact existe déjà dans votre liste.');
            return;
        }
        if (!user.name) {
            user.name = window.prompt('Le nom est requis. Veuillez entrer le nom:');
            if (!user.name) {
                alert('Le nom est requis.');
                return;
            }
        }
        if (!user.email) {
            user.email = window.prompt('L\'email est requis. Veuillez entrer l\'email:');
            if (!user.email) {
                alert('L\'email est requis.');
                return;
            }
        }
        const newContact = { name: user.name, email: user.email, owner: auth.currentUser.uid };
        try {
            const docRef = await addDoc(collection(db, 'contacts'), newContact);
            setContacts([...contacts, { ...newContact, id: docRef.id }]);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du contact:', error);
        }
    };

    const handleUpdateContact = async () => {
        if (editingIndex !== null) {
            const contactToUpdate = contacts[editingIndex];
            const updatedContact = { ...contactToUpdate, name };
            await updateDoc(doc(db, 'contacts', contactToUpdate.id), updatedContact);
            const updatedContacts = contacts.map((contact, index) =>
                index === editingIndex ? updatedContact : contact
            );
            setContacts(updatedContacts);
            setEditingIndex(null);
        }
        setName('');
        setEmail('');
    };

    const handleEditContact = (index) => {
        setName(contacts[index].name);
        setEmail(contacts[index].email);
        setEditingIndex(index);
    };

    const handleDeleteContact = async (index) => {
        const contactToDelete = contacts[index];
        await deleteDoc(doc(db, 'contacts', contactToDelete.id));
        const updatedContacts = contacts.filter((_, i) => i !== index);
        setContacts(updatedContacts);
    };

    const handleCallContact = (email) => {
        alert(`Appeler ${email}`);
    };

    const handleMessageContact = (email) => {
        navigate(`/messages/${email}`);
    };

    return (
        <div className="contact-container">
            <h2>Gestion des Contacts</h2>
            <div className="contact-form">
                <input
                    type="text"
                    placeholder="Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={editingIndex !== null}
                />
                <button onClick={handleUpdateContact}>
                    {editingIndex !== null ? 'Mettre à jour' : 'Ajouter'}
                </button>
            </div>
            <div className="contact-search">
                <input
                    type="text"
                    placeholder="Rechercher par nom ou email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {searchResults.length > 0 && (
                <div className="search-results">
                    <h3>Résultats de la recherche</h3>
                    <ul>
                        {searchResults.map((user, index) => (
                            <li key={index}>
                                {user.name} - {user.email}
                                <button onClick={() => handleAddContact(user)}>Ajouter</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <table className="contact-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map((contact, index) => (
                        <tr key={index}>
                            <td>{contact.name}</td>
                            <td>{contact.email}</td>
                            <td>
                                <button onClick={() => handleEditContact(index)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button onClick={() => handleDeleteContact(index)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                                <button onClick={() => handleCallContact(contact.email)}>
                                    <FontAwesomeIcon icon={faPhone} />
                                </button>
                                <button onClick={() => handleMessageContact(contact.email)}>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Contact;
