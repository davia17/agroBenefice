import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="navbar-header">
      <h3 className="navbar-title"> AgroBénéfice</h3>
      <div className="navbar-user-area">
        <span className="navbar-username">{user?.name || user?.email}</span>
        <button onClick={logout} className="btn-logout">
          Déconnexion
        </button>
      </div>
    </header>
  );
}