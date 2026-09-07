import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Reports';
import ParcelsPage from './pages/Parcels';
import CampaignsPage from './pages/Campaigns';
import TransactionsPage from './pages/Transactions';
import API from './services/api';
import accueilImg from './assets/accueil.jpg'; 
import './index.css';

// --- PAGE D'ACCUEIL ---
function Home() {
  return (
    <div style={{
      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${accueilImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      position: 'relative',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '15px' }}>
        <Link to="/login" style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(5px)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          textDecoration: 'none',
          fontWeight: 'bold',
          border: '1px solid white'
        }}>
          Se connecter
        </Link>
        <Link to="/register" style={{
          background: '#2e7d32',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}>
          S'inscrire
        </Link>
      </div>

      <div style={{ textAlign: 'center', maxWidth: '700px', padding: '20px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
          Bienvenue sur AgroBénéfice
        </h1>
        <p style={{ fontSize: '1.2rem', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>
          Gérez efficacement vos parcelles, vos campagnes et suivez la rentabilité de votre exploitation agricole en toute simplicité.
        </p>
      </div>
    </div>
  );
}

// --- PAGE DE CONNEXION ---
function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard'); 
    } catch (err) {
      alert('Erreur de connexion : ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '450px', margin: '80px auto', background: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#2e7d32', fontWeight: 'bold', fontSize: '14px' }}>
          &larr; 
        </Link>
        <h2 style={{ flex: 1, textAlign: 'center', color: '#2e7d32', margin: 0, marginRight: '40px' }}>
          Connexion
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
        <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '16px' }}>Se connecter</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
        Pas encore de compte ? <Link to="/register" style={{ color: '#2e7d32', fontWeight: 'bold' }}>S'inscrire</Link>
      </p>
    </div>
  );
}

// --- PAGE D'INSCRIPTION ---
function Register() {
  const { login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [exploitationName, setExploitationName] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', { name, email, password, exploitationName, location });
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert('Erreur d\'inscription : ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '500px', margin: '40px auto', background: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#2e7d32', fontWeight: 'bold', fontSize: '14px' }}>
          &larr;
        </Link>
        <h2 style={{ flex: 1, textAlign: 'center', color: '#2e7d32', margin: 0, marginRight: '40px', fontSize: '1.4rem' }}>
          Créer un compte
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ margin: '5px 0', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Personnel</h4>
        <input type="text" placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} required className="form-input" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
        
        <h4 style={{ margin: '10px 0 5px 0', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Exploitation</h4>
        <input type="text" placeholder="Nom de la ferme" value={exploitationName} onChange={e => setExploitationName(e.target.value)} required className="form-input" />
        <input type="text" placeholder="Localisation" value={location} onChange={e => setLocation(e.target.value)} className="form-input" />
        
        <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '10px' }}>
          S'inscrire
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        Déjà inscrit ? <Link to="/login" style={{ color: '#2e7d32', fontWeight: 'bold' }}>Se connecter</Link>
      </p>
    </div>
  );
}

// --- LAYOUTS & ROUTES ---
function MainLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-area">
        <Navbar />
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/parcels" element={<ProtectedRoute><MainLayout><ParcelsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><MainLayout><CampaignsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><MainLayout><TransactionsPage /></MainLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}