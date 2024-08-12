// components/Cardano/CardanoTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import ContributionForms from '../CollectContributions/ContributionFormOptions';
import { useTxData } from '../../context/TxDataContext';

export default function CardanoTxBuilder() {
  const [accountAddress, setAccountAddress] = useState('');
  const { txData, setTxData } = useTxData();
  const [activeForm, setActiveForm] = useState('contribution');

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

    console.log("txData", txData);
    
    return (
      <ContributionForms onContributionSubmit={handleContributionSubmit} tokens={tokens} />
    );
  }