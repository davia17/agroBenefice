import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path ? 'sidebar-link active' : 'sidebar-link inactive';
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Menu</h2>
      <nav className="sidebar-nav">
        <Link to="/dashboard" className={getLinkClass('/dashboard')}>Tableau de bord</Link>
        <Link to="/parcels" className={getLinkClass('/parcels')}>Parcelles</Link>
        <Link to="/campaigns" className={getLinkClass('/campaigns')}>Campagnes</Link>
        <Link to="/transactions" className={getLinkClass('/transactions')}>Transactions</Link>
      </nav>
    </aside>
  );
}