import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function CampaignsPage() {
  const { logout } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [parcelCampaigns, setParcelCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la modale Campagne (Ajout / Modification)
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [description, setDescription] = useState('');

  // États pour la modale Parcelle-Campagne (Ajout / Modification)
  const [isPcModalOpen, setIsPcModalOpen] = useState(false);
  const [editingPcId, setEditingPcId] = useState(null);
  const [targetCampaignId, setTargetCampaignId] = useState(null); // Pour l'ajout
  const [parcelId, setParcelId] = useState('');
  const [cropName, setCropName] = useState('');
  const [cultivatedSurface, setCultivatedSurface] = useState('');
  const [pcStatus, setPcStatus] = useState('PLANNED');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      const [resCamp, resParc, resPc] = await Promise.all([
        API.get('/campaigns'),
        API.get('/parcels'),
        API.get('/parcel-campaigns')
      ]);
      setCampaigns(resCamp.data);
      setParcels(resParc.data);
      setParcelCampaigns(resPc.data);
    } catch (err) {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Gestion Modale Campagne ---
  const handleOpenAddCampaignModal = () => {
    setEditingCampaignId(null);
    setName('');
    setStartDate('');
    setEndDate('');
    setStatus('ACTIVE');
    setDescription('');
    setIsCampaignModalOpen(true);
  };

  const handleOpenEditCampaignModal = (c) => {
    setEditingCampaignId(c._id);
    setName(c.name);
    setStartDate(c.startDate ? c.startDate.split('T')[0] : '');
    setEndDate(c.endDate ? c.endDate.split('T')[0] : '');
    setStatus(c.status || 'ACTIVE');
    setDescription(c.description || '');
    setIsCampaignModalOpen(true);
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, startDate, endDate: endDate || null, status, description };
      if (editingCampaignId) {
        await API.put(`/campaigns/${editingCampaignId}`, payload);
      } else {
        await API.post('/campaigns', payload);
      }
      setIsCampaignModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Supprimer cette campagne ?')) return;
    try {
      await API.delete(`/campaigns/${id}`);
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  // --- Gestion Modale Parcelle-Campagne ---
  const handleOpenAddParcelModal = (campaignId) => {
    setTargetCampaignId(campaignId);
    setEditingPcId(null);
    setParcelId('');
    setCropName('');
    setCultivatedSurface('');
    setPcStatus('PLANNED');
    setNotes('');
    setIsPcModalOpen(true);
  };

  const handleOpenEditParcelModal = (pc) => {
    setEditingPcId(pc._id);
    setTargetCampaignId(pc.campaign?._id || pc.campaign);
    setParcelId(pc.parcel?._id || pc.parcel);
    setCropName(pc.cropName);
    setCultivatedSurface(pc.cultivatedSurface);
    setPcStatus(pc.status);
    setNotes(pc.notes || '');
    setIsPcModalOpen(true);
  };

  const handlePcSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        campaign: targetCampaignId,
        parcel: parcelId,
        cropName,
        cultivatedSurface: Number(cultivatedSurface),
        status: pcStatus,
        notes
      };

      if (editingPcId) {
        await API.put(`/parcel-campaigns/${editingPcId}`, {
          cropName,
          cultivatedSurface: Number(cultivatedSurface),
          status: pcStatus,
          notes
        });
      } else {
        await API.post('/parcel-campaigns', payload);
      }

      setIsPcModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteParcelCampaign = async (pcId) => {
    if (!window.confirm('Retirer cette parcelle de la campagne ?')) return;
    try {
      await API.delete(`/parcel-campaigns/${pcId}`);
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div>
      {/* En-tête de la page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestion des Campagnes et Parcelles Cultivées</h2>
        <button 
          onClick={handleOpenAddCampaignModal} 
          style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Ajouter une campagne
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div>
          {campaigns.length === 0 ? (
            <p>Aucune campagne trouvée.</p>
          ) : (
            campaigns.map(c => {
              const associatedParcels = parcelCampaigns.filter(pc => (pc.campaign?._id || pc.campaign) === c._id);

              return (
                <div key={c._id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{c.name} <span style={{ fontSize: '12px', padding: '2px 8px', background: '#e2e8f0', borderRadius: '4px' }}>{c.status}</span></h3>
                      <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                        Du {c.startDate ? new Date(c.startDate).toLocaleDateString() : '-'} au {c.endDate ? new Date(c.endDate).toLocaleDateString() : '-'} {c.description ? `| ${c.description}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleOpenEditCampaignModal(c)} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}>Modifier</button>
                      <button onClick={() => handleDeleteCampaign(c._id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}>Supprimer</button>
                    </div>
                  </div>

                  <hr style={{ margin: '15px 0', borderColor: '#f1f1f1' }} />

                  <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#334155' }}>Parcelles et cultures incluses :</h4>
                  {associatedParcels.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '14px' }}>Aucune parcelle assignée à cette campagne pour l'instant.</p>
                  ) : (
                    <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th>Parcelle</th>
                          <th>Culture</th>
                          <th>Surface Cultivée</th>
                          <th>Statut</th>
                          <th>Notes</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {associatedParcels.map(pc => (
                          <tr key={pc._id}>
                            <td>{pc.parcel?.name || 'Parcelle inconnue'}</td>
                            <td>{pc.cropName}</td>
                            <td>{pc.cultivatedSurface}</td>
                            <td>{pc.status}</td>
                            <td>{pc.notes || '-'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleOpenEditParcelModal(pc)} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '3px' }}>Modifier</button>
                                <button onClick={() => handleDeleteParcelCampaign(pc._id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '3px' }}>Retirer</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <button onClick={() => handleOpenAddParcelModal(c._id)} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                    + Ajouter une parcelle à cette campagne
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modale pour Campagne (Ajout / Modification) */}
      {isCampaignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0, color: '#2e7d32' }}>{editingCampaignId ? 'Modifier la campagne' : 'Ajouter une campagne'}</h3>
            <form onSubmit={handleCampaignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Nom de la campagne</label>
                <input type="text" placeholder="Ex: Campagne Hivernage 2026" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Date de début</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Date de fin</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Statut</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                  <option value="PLANNED">Planifiée</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Clôturée</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Description</label>
                <input type="text" placeholder="Description optionnelle" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setIsCampaignModalOpen(false)} style={{ background: '#cbd5e1', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{editingCampaignId ? 'Mettre à jour' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale pour l'Association Parcelle-Campagne (Ajout / Modification) */}
      {isPcModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0, color: '#2e7d32' }}>{editingPcId ? 'Modifier la culture de la parcelle' : 'Ajouter une parcelle à la campagne'}</h3>
            <form onSubmit={handlePcSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!editingPcId && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Parcelle</label>
                  <select value={parcelId} onChange={e => setParcelId(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                    <option value="">-- Choisir une parcelle --</option>
                    {parcels.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.surface} {p.unit})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Nom de la culture</label>
                <input type="text" placeholder="Ex: Riz, Maïs..." value={cropName} onChange={e => setCropName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Surface cultivée</label>
                <input type="number" step="0.01" placeholder="Ex: 1.5" value={cultivatedSurface} onChange={e => setCultivatedSurface(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Statut de la culture</label>
                <select value={pcStatus} onChange={e => setPcStatus(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                  <option value="PLANNED">Planifiée</option>
                  <option value="GROWING">En croissance</option>
                  <option value="HARVESTED">Récoltée</option>
                  <option value="FAILED">Échouée</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Notes</label>
                <input type="text" placeholder="Ex: Utilisation d'engrais organique..." value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setIsPcModalOpen(false)} style={{ background: '#cbd5e1', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{editingPcId ? 'Mettre à jour' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}