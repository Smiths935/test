import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider } from '../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { toast } from 'react-toastify';
import "./auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
      toast.success("Connexion réussie !");
    } catch (error) {
      toast.error("Email ou mot de passe incorrect.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/home');
      toast.success("Connexion avec Google réussie !");
    } catch (error) {
      toast.error("Une erreur est survenue lors de la connexion avec Google. Veuillez réessayer.");
    }
  };

  return (
    <div className="login-container">
      <div className="waves"></div>
      <div className="login-form">
        <h2>Connexion</h2>
        <form onSubmit={handleLogin}>
          <div className="input-field">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label>Email</label>
          </div>
          <div className="input-field">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <label>Mot de passe</label>
          </div>
          <button type="submit" className="btn black">Se connecter</button>
          <button type="button" className="btn google" onClick={handleGoogleLogin}>
            Connexion avec Google
          </button>
        </form>
        <p>
          Pas de compte? <Link to="/signup">Inscrivez-vous</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
