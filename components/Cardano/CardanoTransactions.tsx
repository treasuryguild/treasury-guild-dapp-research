// components/PolkadotTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import ContributionForm from '../CollectContributions/ContributionForm';
import { useTxData } from '../../context/TxDataContext';

export default function CardanoTransactions() {
  const [accountAddress, setAccountAddress] = useState('');
  const { txData, setTxData } = useTxData();

  const handleContributionSubmit = async (contributions: any) => {
    console.log('Submitting contributions:', contributions);
  };  

  let tokens = [
    { symbol: "ADA", 
      balance:"",
      name: "Lovelace",
      decimals: 0,
      contractAddress: '',
      policy_id: '',
      blockchain: 'Cardano',
    }, {
      symbol: "AGIX", 
      balance: "",
      name: "SingularityNET",
      decimals: 0,
      contractAddress: '',
      policy_id: '',
      blockchain: 'Cardano',
    }]
  return (
    <>
      <ContributionForm onSubmit={handleContributionSubmit} tokens={tokens}/>

    </>
  );
};
