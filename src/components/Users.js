// src/components/Users.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import PropTypes from 'prop-types';
import './Users.css';

const Users = ({ onSelectUser }) => {
    const [users, setUsers] = useState([]);
    const [user] = useAuthState(auth);

    useEffect(() => {
        const fetchUsers = async () => {
            const q = query(collection(db, 'users'), where('uid', '!=', user.uid));
            const querySnapshot = await getDocs(q);
            const usersData = [];
            querySnapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() });
            });
            setUsers(usersData);
        };

        if (user) {
            fetchUsers();
        }
    }, [user]);

    return (
        <div className="usersList">
            <h3>Contacts</h3>
            <ul>
                {users.map((user) => (
                    <li key={user.id} onClick={() => onSelectUser(user.email)}>
                        <span>{user.name || user.email}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

Users.propTypes = {
    onSelectUser: PropTypes.func.isRequired,
};

export default Users;
