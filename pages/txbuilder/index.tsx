// pages/txbuilder/index.tsx
import React, { useState, useEffect } from 'react';
import TxLayout from '../../layouts/TxLayout'; // Adjust the path as necessary
import PolkadotTxBuilder from '../../components/PolkadotTxBuilder';
import CardanoTxBuilder from '../../components/CardanoTxBuilder'; // Assuming a similar component for Cardano
import WalletConnector from '../../components/WalletConnector';
import { useTxData } from '../../context/TxDataContext';

export default function TxBuilder() {
  // State to track the current blockchain selection ('Polkadot' or 'Cardano')
  const [blockchain, setBlockchain] = useState('Polkadot');
  const { txData, setTxData } = useTxData();
  const [wsProvider, setWsProvider] = useState('');

  useEffect(() => {
    // Update the provider when it changes
    const updateProvider = async () => {
      const { provider } = txData;
      console.log('Provider:', provider);
      if (!provider) {
        console.error('Provider not found in txData');
        return;
      } 

      setWsProvider(provider);
    };
    updateProvider();
  }, [txData.provider]);

  return (
    <TxLayout>
      <h1>Transaction Builder</h1>
      <h3>Selected network - {blockchain}</h3>
      <WalletConnector />
      <p>Use this page to build and submit transactions to the selected network.</p>

      {/* UI for selecting the blockchain */}
      <div>
        <button onClick={() => setBlockchain('Polkadot')}>Polkadot</button>
        <button onClick={() => setBlockchain('Cardano')}>Cardano</button>
      </div>

      {/* Conditionally render the transaction builder based on the selection */}
      {(blockchain === 'Polkadot' && wsProvider) ? (
        <PolkadotTxBuilder />
      ) : (
        <CardanoTxBuilder />
      )}
    </TxLayout>
  );
}
