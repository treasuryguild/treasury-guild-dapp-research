// components/PolkadotTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import ContributionForm from '../ContributionForm';
import { useTxData } from '../../context/TxDataContext';

export default function CardanoTxBuilder() {
  const [accountAddress, setAccountAddress] = useState('');
  const { txData, setTxData } = useTxData();

  const handleContributionSubmit = async (contributions: any) => {
    console.log('Submitting contributions:', contributions);
  };  

  let tokens = ["ADA", "AGIX"]
  return (
    <>
      <ContributionForm onSubmit={handleContributionSubmit} tokens={tokens}/>

    </>
  );
};
