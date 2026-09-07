import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function ReportsPage() {
  const { logout } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger la liste des campagnes pour le filtre
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await API.get('/campaigns');
        setCampaigns(res.data);
      } catch (err) {
        setError('Erreur lors du chargement des campagnes.');
      }
    };
    fetchCampaigns();
  }, []);

  // Charger le résumé financier à chaque changement de filtre
  const fetchSummary = async (campaignId) => {
    setLoading(true);
    try {
      const url = campaignId ? `/analytics/summary?campaign=${campaignId}` : '/analytics/summary';
      const res = await API.get(url);
      setSummary(res.data);
    } catch (err) {
      setError('Erreur lors du calcul du résumé financier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedCampaign);
  }, [selectedCampaign]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>Rapports & Bilan Financier</h2>

      {/* Filtre par campagne */}
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrer par campagne :</label>
        <select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)} style={{ padding: '5px' }}>
          <option value="">Toute l'exploitation (Global)</option>
          {campaigns.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Calcul en cours...</p>
      ) : summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          
          <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h4>Revenus Totaux (Entrées)</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d47a1', margin: '10px 0 0 0' }}>
              {summary.totalIncome.toLocaleString()} {summary.currency}
            </p>
          </div>

          <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h4>Dépenses Totales (Sorties)</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#c62828', margin: '10px 0 0 0' }}>
              {summary.totalExpense.toLocaleString()} {summary.currency}
            </p>
          </div>

          <div style={{ background: summary.netProfit >= 0 ? '#e8f5e9' : '#fff3e0', padding: '20px', borderRadius: '8px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <h4>Bénéfice Net</h4>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: summary.netProfit >= 0 ? '#2e7d32' : '#ef6c00', margin: '10px 0 0 0' }}>
              {summary.netProfit.toLocaleString()} {summary.currency}
            </p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Basé sur {summary.transactionCount} transaction(s) — {summary.scope}
            </p>
          </div>

        </div>
      ) : null}
    </div>
  );
}