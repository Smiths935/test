import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, provider } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { setDoc, doc, getDocs, collection, query, where } from "firebase/firestore";
import { toast } from 'react-toastify';
import "./auth.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const usernameQuery = query(collection(db, "users"), where("username", "==", username));
      const emailQuery = query(collection(db, "users"), where("email", "==", email));

      const usernameSnapshot = await getDocs(usernameQuery);
      const emailSnapshot = await getDocs(emailQuery);

      if (!usernameSnapshot.empty) {
        toast.error("Le nom d&apos;utilisateur est déjà utilisé.");
        return;
      }

      if (!emailSnapshot.empty) {
        toast.error("L&apos;adresse email est déjà utilisée.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        createdAt: new Date(),
      });

      navigate('/home');
      toast.success("Inscription réussie !");
    } catch (error) {
      if (error.code === 'permission-denied') {
        toast.error("Permissions insuffisantes pour effectuer cette action.");
      } else {
        toast.error("Une erreur est survenue lors de l&apos;inscription. Veuillez réessayer.");
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const emailQuery = query(collection(db, "users"), where("email", "==", user.email));
      const emailSnapshot = await getDocs(emailQuery);

      if (emailSnapshot.empty) {
        await setDoc(doc(db, "users", user.uid), {
          username: user.displayName,
          email: user.email,
          createdAt: new Date(),
        });
      }

      navigate('/home');
      toast.success("Inscription avec Google réussie !");
    } catch (error) {
      if (error.code === 'permission-denied') {
        toast.error("Permissions insuffisantes pour effectuer cette action.");
      } else {
        toast.error("Une erreur est survenue lors de l&apos;inscription avec Google. Veuillez réessayer.");
      }
    }
  };

  return (
    <body className="bodyLog">  

    <div className="signup-container">
      <div className="waves"></div>
      <div className="signup-form">
        <h2>Inscription</h2>
        <form onSubmit={handleSignup}>
          <div className="input-field">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <label>Nom d&apos;utilisateur</label>
          </div>
          <div className="input-field">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label>Email</label>
          </div>
          <div className="input-field">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <label>Mot de passe</label>
          </div>
          <button type="submit" className="btn black">S&apos;inscrire</button>
          <button type="button" className="btn google" onClick={handleGoogleSignup}>
            Inscription avec Google
          </button>
        </form>
        <p>
          Déjà un compte? <Link to="/login">Connexion</Link>
        </p>
      </div>
    </div>
    </body>
  );
};

export default Signup;
