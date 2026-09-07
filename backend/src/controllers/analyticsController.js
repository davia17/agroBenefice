const Transaction = require('../models/Transaction');

// Calculer le résumé financier (Revenus, Dépenses, Bénéfice Net)
const getFinancialSummary = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    
    // Si l'utilisateur demande le bilan d'une campagne spécifique
    if (req.query.campaign) {
      filter.campaign = req.query.campaign;
    }

    const transactions = await Transaction.find(filter);

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else if (t.type === 'EXPENSE') {
        totalExpense += t.amount;
      }
    });

    // Si on regarde le bilan global de l'exploitation (sans filtre de campagne), 
    // on s'assure aussi d'inclure les charges globales (celles qui n'ont pas de campagne, ex: le tracteur)
    // puisque le filtre ci-dessus avec `user` récupère déjà TOUTES les transactions de l'utilisateur.

    const netProfit = totalIncome - totalExpense;

    res.json({
      scope: req.query.campaign ? `Campagne: ${req.query.campaign}` : "Exploitation globale (Toutes campagnes + Investissements)",
      totalIncome,
      totalExpense,
      netProfit,
      currency: "MGA",
      transactionCount: transactions.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFinancialSummary
};