// components/ContributionForm.jsx
import React, { useState } from 'react';
import styles from '../styles/ContributionForm.module.css';

function ContributionForm({ onSubmit, tokens }: { onSubmit: any, tokens: { symbol: string, balance: string }[] }) {
  const [contributions, setContributions] = useState([
    { id: 1, name: '', labels: '', date: new Date().toISOString().split('T')[0], walletAddress: '', role: '', tokenAmounts: tokens.map(tokenObj => ({ token: tokenObj.symbol, amount: '' })) }
  ]);

  // Unique ID for new contributions
  const getNextId = () => Math.max(...contributions.map(c => c.id)) + 1;

  const handleChange = (id: any, field: any, value: any, token = null) => {
    const newContributions = contributions.map(contribution => {
      if (contribution.id === id) {
        if (token) {
          const updatedTokenAmounts = contribution.tokenAmounts.length > 0
            ? contribution.tokenAmounts.map(ta => ta.token === token ? { ...ta, amount: value } : ta)
            : tokens.map(tokenObj => ({ token: tokenObj.symbol, amount: tokenObj.symbol === token ? value : '' }));
          return { ...contribution, tokenAmounts: updatedTokenAmounts };
        }
        return { ...contribution, [field]: value };
      }
      return contribution;
    });
    setContributions(newContributions);
  };

  const addContribution = () => {
    setContributions([...contributions, { id: getNextId(), name: '', labels: '', date: new Date().toISOString().split('T')[0], walletAddress: '', role: '', tokenAmounts: tokens.map(tokenObj => ({ token: tokenObj.symbol, amount: '' })) }]);
  };

  const removeContribution = (id: any) => {
    setContributions(contributions.filter(contribution => contribution.id !== id));
  };

  const checkForDuplicates = () => {
    const seen = new Set();
    for (const contribution of contributions) {
      for (const tokenAmount of contribution.tokenAmounts) {
        const key = `${contribution.name}-${contribution.labels}-${contribution.date}-${contribution.walletAddress}-${contribution.role}-${tokenAmount.token}-${tokenAmount.amount}`;
        if (seen.has(key)) {
          return true;
        }
        seen.add(key);
      }
    }
    return false;
  };

  // Preparing contributions for submission by grouping them based on name, labels, and date
  const prepareForSubmission = () => {
    const grouped = contributions.reduce((acc: any, current: any) => {
      const { name, labels, date, walletAddress, role, tokenAmounts } = current;
      const key = `${name}-${labels}-${date}`;
      if (!acc[key]) {
        acc[key] = { name, labels, date, contributors: [] };
      }
      acc[key].contributors.push({ walletAddress, role, tokens: tokenAmounts });
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (checkForDuplicates()) {
      alert('Duplicate contributions detected. Please review your entries.');
      return;
    }
    const preparedContributions = prepareForSubmission();
    onSubmit(preparedContributions);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <table className={styles.table}>
  <thead>
    <tr>
      <th>Name of Contribution</th>
      <th>Labels (comma-separated)</th>
      <th>Date</th>
      <th>Wallet Address</th>
      <th>Role</th>
      {tokens.map((token) => (
        <th key={token.symbol}>{token.symbol}</th>
      ))}
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {contributions.map((contribution, index, arr) => {
      const isSameGroupAsPrevious = index > 0 && contribution.name === arr[index - 1].name && contribution.labels === arr[index - 1].labels && contribution.date === arr[index - 1].date;
      return (
        <tr key={contribution.id}>
          <td>
            <input
              type="text"
              value={contribution.name}
              onChange={(e) => handleChange(contribution.id, 'name', e.target.value)}
              className={styles.input}
            />
          </td>
          <td>
            <input
              type="text"
              value={contribution.labels}
              onChange={(e) => handleChange(contribution.id, 'labels', e.target.value)}
              className={styles.input}
            />
          </td>
          <td>
            <input
              type="date"
              value={contribution.date}
              onChange={(e) => handleChange(contribution.id, 'date', e.target.value)}
              className={styles.input}
            />
          </td>
          <td>
            <input
              type="text"
              value={contribution.walletAddress}
              onChange={(e) => handleChange(contribution.id, 'walletAddress', e.target.value)}
              className={styles.input}
            />
          </td>
          <td>
            <input
              type="text"
              value={contribution.role}
              onChange={(e) => handleChange(contribution.id, 'role', e.target.value)}
              className={styles.input}
            />
          </td>
          {tokens.map((token: any) => (
            <td key={token.symbol}>
              <input
                type="text"
                value={contribution.tokenAmounts.find(ta => ta.token === token.symbol)?.amount || ''}
                onChange={(e) => handleChange(contribution.id, 'amount', e.target.value, token.symbol)}
                className={styles.input}
                placeholder="Amount"
              />
            </td>
          ))}
          <td>
            <button type="button" onClick={() => removeContribution(contribution.id)} className={styles.button}>
              Remove
            </button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
<button type="button" onClick={addContribution} className={styles.button}>
  Add New Contribution
</button>
<button type="submit" className={styles.button}>Submit Contributions</button>

    </form>
  );
}

export default ContributionForm;