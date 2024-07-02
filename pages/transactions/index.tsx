// pages/transactions/index.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TxLayout from '../../layouts/TxLayout';
import PolkadotTransactions from '../../components/Polkadot/PolkadotTransactions';
import CardanoTransactions from '../../components/Cardano/CardanoTransactions';
import CardanoWalletConnect from '../../components/Cardano/CardanoWalletConnect';
import { useTxData } from '../../context/TxDataContext';
import styles from '../../styles/TxBuilder.module.css';

const PolkadotWalletConnect = dynamic(
  () => import('../../components/Polkadot/PolkadotWalletConnect'),
  { ssr: false }
);

export default function Transactions() {
  const [blockchain, setBlockchain] = useState('Polkadot');
  const { txData, setTxData } = useTxData();
  const [wsProvider, setWsProvider] = useState('');
  const [polkadotBalanceLoaded, setPolkadotBalanceLoaded] = useState(false);
  const [polkadotWalletConnected, setPolkadotWalletConnected] = useState(false);

  useEffect(() => {
    const updateProvider = async () => {
      const { provider } = txData;
      if (!provider) {
        console.error('Provider not found in txData');
        return;
      }
      setWsProvider(provider);
    };
    updateProvider();

    // Check local storage for Polkadot wallet connection status on component mount
    const polkadotConnected = localStorage.getItem('polkadotWalletConnected') === 'true';
    setPolkadotWalletConnected(polkadotConnected);
  }, [txData.provider]);

  const handlePolkadotWalletConnection = (connected: any) => {
    setPolkadotWalletConnected(connected);
    localStorage.setItem('polkadotWalletConnected', connected.toString());
  };

  return (
    <TxLayout blockchain={blockchain}>
      <div className={styles.container}>
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={() => setBlockchain('Polkadot')}>Polkadot</button>
          <button className={styles.button} onClick={() => setBlockchain('Cardano')}>Cardano</button>
        </div>
        <div className={styles.content}>
          {blockchain === 'Polkadot' ? (
            <>
              <PolkadotWalletConnect 
                onBalanceLoaded={setPolkadotBalanceLoaded}
                isConnected={polkadotWalletConnected}
                onConnectionChange={handlePolkadotWalletConnection}
              />
              {polkadotBalanceLoaded && polkadotWalletConnected && <PolkadotTransactions />}
            </>
          ) : (
            <>
              <CardanoWalletConnect />
              <CardanoTransactions />
            </>
          )}
        </div>
      </div>
    </TxLayout>
  );
}