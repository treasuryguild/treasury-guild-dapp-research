// components/Cardano/CardanoTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import ContributionFormOptions from '../CollectContributions/ContributionFormOptions';
import { useCardanoData } from '../../context/CardanoContext';
import { useWallet } from '../../context/WalletContext';

export default function CardanoTxBuilder() {
  const [accountAddress, setAccountAddress] = useState('');
  const { cardanoData, setCardanoData } = useCardanoData();
  const { cardanoWallet, supabaseAuthClient } = useWallet();

  const handleContributionSubmit = async (contributions: any, cardanoData: any, supabaseAuthClient: any) => {
    console.log('Submitting contributions:', contributions, cardanoData);
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
      <ContributionFormOptions
          onContributionSubmit={(contributions) =>
            handleContributionSubmit(
              contributions,
              cardanoData,
              supabaseAuthClient
            )
          }
          tokens={tokens}
        />
    );
  }