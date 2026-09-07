import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function ParcelsPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gestion de la modale et du formulaire
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [surface, setSurface] = useState('');
  const [unit, setUnit] = useState('ha');
  const [status, setStatus] = useState('ACTIVE');

  const fetchParcels = async () => {
    try {
      const res = await API.get('/parcels');
      setParcels(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des parcelles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  // Ouvrir la modale en mode Ajout
  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setSurface('');
    setUnit('ha');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  // Ouvrir la modale en mode Modification
  const handleOpenEditModal = (p) => {
    setEditingId(p._id);
    setName(p.name);
    setSurface(p.surface);
    setUnit(p.unit || 'ha');
    setStatus(p.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // Soumission du formulaire (Création ou Mise à jour)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, surface: Number(surface), unit, status };
      if (editingId) {
        await API.put(`/parcels/${editingId}`, payload);
      } else {
        await API.post('/parcels', payload);
      }
      handleCloseModal();
      fetchParcels();
    } catch (err) {
      alert('Erreur lors de l’enregistrement : ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette parcelle ?')) return;
    try {
      await API.delete(`/parcels/${id}`);
      fetchParcels();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div>
      {/* En-tête de la page avec le bouton d'ajout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestion des Parcelles</h2>
        <button 
          onClick={handleOpenAddModal} 
          style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Ajouter une parcelle
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f1f1f1' }}>
              <th>Nom</th>
              <th>Surface</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>Aucune parcelle trouvée.</td></tr>
            ) : (
              parcels.map(p => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.surface} {p.unit}</td>
                  <td>{p.status}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleOpenEditModal(p)} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>Modifier</button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Fenêtre Modale pour l'Ajout / Modification */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0, color: '#2e7d32' }}>{editingId ? 'Modifier la parcelle' : 'Ajouter une parcelle'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Nom de la parcelle</label>
                <input type="text" placeholder="Ex: Champ Est" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Surface</label>
                <input type="number" placeholder="Ex: 2.5" value={surface} onChange={e => setSurface(e.target.value)} step="0.01" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Unité</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                  <option value="ha">Hectares (ha)</option>
                  <option value="ares">Ares (a)</option>
                  <option value="m2">m²</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Statut</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                  <option value="ACTIVE">Active</option>
                  <option value="FALLOW">Jachère</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={handleCloseModal} style={{ background: '#cbd5e1', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{editingId ? 'Mettre à jour' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}