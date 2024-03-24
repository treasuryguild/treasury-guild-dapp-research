// components/ContributionForm.jsx

import React, { useState } from 'react';

function ContributionForm({ onSubmit }: any) {
  const [contributions, setContributions] = useState([
    { name: '', labels: '', date: new Date().toISOString().split('T')[0], contributors: [{ walletAddress: '', role: '', amount: '' }] }
  ]);

  const handleChange = (index: any, field: any, value: any) => {
    const newContributions: any = [...contributions];
    if (field === 'name' || field === 'labels' || field === 'date') {
      newContributions[index][field] = value;
    } else { // Updating contributors
      const [contributorIndex, contributorField] = field.split('.');
      newContributions[index].contributors[contributorIndex][contributorField] = value;
    }
    setContributions(newContributions);
  };

  const addContributor = (index: any) => {
    const newContributions = [...contributions];
    newContributions[index].contributors.push({ walletAddress: '', role: '', amount: '' });
    setContributions(newContributions);
  };

  const addContribution = () => {
    setContributions([...contributions, { name: '', labels: '', date: new Date().toISOString().split('T')[0], contributors: [{ walletAddress: '', role: '', amount: '' }] }]);
  };

  const removeContributor = (contributionIndex: number, contributorIndex: number) => {
    const newContributions = [...contributions];
    newContributions[contributionIndex].contributors = newContributions[contributionIndex].contributors.filter((_, index) => index !== contributorIndex);
    setContributions(newContributions);
  };
  
  const removeContribution = (index: number) => {
    setContributions(contributions.filter((_, contributionIndex) => contributionIndex !== index));
  };  

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(contributions);
  };

  return (
    <form onSubmit={handleSubmit}>
      {contributions.map((contribution, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Name of Contribution"
            value={contribution.name}
            onChange={(e) => handleChange(index, 'name', e.target.value)}
          />
          <input
            type="text"
            placeholder="Labels (comma-separated)"
            value={contribution.labels}
            onChange={(e) => handleChange(index, 'labels', e.target.value)}
          />
          <input
            type="date"
            value={contribution.date}
            onChange={(e) => handleChange(index, 'date', e.target.value)}
          />
          {contribution.contributors.map((contributor, cIndex) => (
            <div key={cIndex}>
              <input
                type="text"
                placeholder="Wallet Address"
                value={contributor.walletAddress}
                onChange={(e) => handleChange(index, `${cIndex}.walletAddress`, e.target.value)}
              />
              <input
                type="text"
                placeholder="Role"
                value={contributor.role}
                onChange={(e) => handleChange(index, `${cIndex}.role`, e.target.value)}
              />
              <input
                type="text"
                placeholder="Amount"
                value={contributor.amount}
                onChange={(e) => handleChange(index, `${cIndex}.amount`, e.target.value)}
              />
            <button type="button" onClick={() => removeContributor(index, cIndex)}>Remove Contributor</button>
          </div>
        ))}
        <button type="button" onClick={() => addContributor(index)}>Add Contributor</button>
        <button type="button" onClick={() => removeContribution(index)}>Remove Contribution</button>
      </div>
    ))}
    <button type="button" onClick={addContribution}>Add Contribution</button>
    <button type="submit">Submit Contributions</button>
  </form>
);
}

export default ContributionForm;
