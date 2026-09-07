import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function TransactionsPage() {
  const { logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la modale (Ajout / Modification)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('SEEDS');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('MGA');
  const [campaign, setCampaign] = useState('');
  const [parcel, setParcel] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const fetchData = async () => {
    try {
      const [resTrans, resCamp, resParc] = await Promise.all([
        API.get('/transactions'),
        API.get('/campaigns'),
        API.get('/parcels')
      ]);
      setTransactions(resTrans.data);
      setCampaigns(resCamp.data);
      setParcels(resParc.data);
    } catch (err) {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Gestion de la modale ---
  const handleOpenAddModal = () => {
    setEditingId(null);
    setType('EXPENSE');
    setCategory('SEEDS');
    setAmount('');
    setCurrency('MGA');
    setCampaign('');
    setParcel('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t) => {
    setEditingId(t._id);
    setType(t.type);
    setCategory(t.category);
    setAmount(t.amount);
    setCurrency(t.currency || 'MGA');
    setCampaign(t.campaign?._id || t.campaign || '');
    setParcel(t.parcel?._id || t.parcel || '');
    setDate(t.date ? t.date.split('T')[0] : '');
    setDescription(t.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type,
        category,
        amount: Number(amount),
        currency,
        campaign: campaign || null,
        parcel: parcel || null,
        date,
        description
      };

      if (editingId) {
        await API.put(`/transactions/${editingId}`, payload);
      } else {
        await API.post('/transactions', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette transaction ?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Gestion des Transactions (Recettes & Dépenses)</h2>
        <button 
          onClick={handleOpenAddModal} 
          style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Ajouter une transaction
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {loading ? <p>Chargement...</p> : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th>Date</th>
              <th>Type</th>
              <th>Catégorie</th>
              <th>Montant</th>
              <th>Campagne</th>
              <th>Parcelle</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', fontStyle: 'italic', color: '#64748b' }}>Aucune transaction trouvée.</td></tr>
            ) : (
              transactions.map(t => (
                <tr key={t._id}>
                  <td>{t.date ? new Date(t.date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span style={{ color: t.type === 'INCOME' ? 'green' : 'red', fontWeight: 'bold' }}>
                      {t.type === 'INCOME' ? 'Recette' : 'Dépense'}
                    </span>
                  </td>
                  <td>{t.category}</td>
                  <td>{t.amount} {t.currency}</td>
                  <td>{t.campaign?.name || '-'}</td>
                  <td>{t.parcel?.name || '-'}</td>
                  <td>{t.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleOpenEditModal(t)} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '3px' }}>Modifier</button>
                      <button onClick={() => handleDelete(t._id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '3px' }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Modale d'ajout / modification */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0, color: '#2e7d32' }}>{editingId ? 'Modifier la transaction' : 'Ajouter une transaction'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Type de transaction</label>
                <select value={type} onChange={e => setType(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                  <option value="EXPENSE">Dépense (Charge)</option>
                  <option value="INCOME">Recette (Vente/Revenu)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Catégorie</label>
                <select value={category} onChange={e => setCategory(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                  <option value="SEEDS">Semences</option>
                  <option value="FERTILIZER">Engrais</option>
                  <option value="PESTICIDE">Pesticide</option>
                  <option value="LABOR">Main-d'œuvre</option>
                  <option value="FUEL">Carburant</option>
                  <option value="EQUIPMENT_PURCHASE">Achat de matériel</option>
                  <option value="MAINTENANCE">Maintenance / Réparation</option>
                  <option value="GENERAL_OVERHEAD">Frais généraux</option>
                  <option value="HARVEST_SALE">Vente de récolte</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Montant</label>
                  <input type="number" placeholder="Ex: 50000" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Devise</label>
                  <input type="text" placeholder="MGA" value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Campagne (Optionnelle)</label>
                <select value={campaign} onChange={e => setCampaign(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                  <option value="">-- Aucune --</option>
                  {campaigns.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Parcelle (Optionnelle)</label>
                <select value={parcel} onChange={e => setParcel(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                  <option value="">-- Aucune --</option>
                  {parcels.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Description</label>
                <input type="text" placeholder="Détails supplémentaires..." value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#cbd5e1', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}