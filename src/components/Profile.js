import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import './Profile.css';

const Profile = () => {
    const [user, loading] = useAuthState(auth);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!user) return navigate('/login');
        fetchUserData();
    }, [user, loading]);

    const fetchUserData = async () => {
        try {
            const userDoc = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setName(userData.name || '');
                setEmail(userData.email || '');
                setPhone(userData.phone || '');
                setAddress(userData.address || '');
            }
        } catch (error) {
            console.error("erreur de connexion': ", error);
            setError('erreur de connexion');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name || !email) {
            setError('Tout les champs doivent être remplir');
            return;
        }
        try {
            const userDoc = doc(db, 'users', user.uid);
            await updateDoc(userDoc, { name, email, phone, address });
            setSuccess('mise à jour effectué');
        } catch (error) {
            console.error("erreur de mise à jour: ", error);
            setError('erreur de mise à jour du profile');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const userDoc = doc(db, 'users', user.uid);
            await deleteDoc(userDoc);
            await user.delete();
            navigate('/signup');
        } catch (error) {
            console.error("erreur de suppression du compte: ", error);
            setError('erreur de suppression du compte');
        }
    };

    return (
        <div className="profile-container">
            <h2>Mon Profil</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                    <label>Nom</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled
                    />
                </div>
                <div className="form-group">
                    <label>Téléphone</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Adresse</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <button type="submit">Mettre à jour</button>
            </form>
            <button className="delete-account" onClick={handleDeleteAccount}>Supprimer le compte</button>
        </div>
    );
};

export default Profile;
