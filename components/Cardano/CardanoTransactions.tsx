// components/Cardano/CardanoTransactions.tsx
import React, { useState, useEffect } from 'react';

export default function CardanoTransactions() {
  const [accountAddress, setAccountAddress] = useState('');
  

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
      <div>
        Cardano Transactions
      </div>
    </>
  );
};
