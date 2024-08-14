// components/Cardano/CardanoTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import ContributionForms from '../CollectContributions/ContributionFormOptions';
import { useCardanoData } from '../../context/CardanoContext';

export default function CardanoTxBuilder() {
  const [accountAddress, setAccountAddress] = useState('');
  const { cardanoData, setCardanoData } = useCardanoData();
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

    console.log("CardanoData", cardanoData);
    
    return (
      <ContributionForms onContributionSubmit={handleContributionSubmit} tokens={tokens} />
    );
  }