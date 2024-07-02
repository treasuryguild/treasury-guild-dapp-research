// ../pages/txbuilder/index.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TxBuilderLayout from '../../layouts/TxBuilderLayout';
import styles from '../../styles/TxBuilder.module.css';

const PolkadotTxBuilder = dynamic(
  () => import('../../components/Polkadot/PolkadotTxBuilder'),
  { ssr: false }
);

const CardanoTxBuilder = dynamic(
  () => import('../../components/Cardano/CardanoTxBuilder'),
  { ssr: false }
);

const PolkadotWalletConnect = dynamic(
  () => import('../../components/Polkadot/PolkadotWalletConnect'),
  { ssr: false }
);

const CardanoWalletConnect = dynamic(
  () => import('../../components/Cardano/CardanoWalletConnect'),
  { ssr: false }
);

export default function TxBuilder() {
  const [blockchain, setBlockchain] = useState('Polkadot');
  const [polkadotBalanceLoaded, setPolkadotBalanceLoaded] = useState(false);
  const [polkadotWalletConnected, setPolkadotWalletConnected] = useState(false);

  useEffect(() => {
    // Check local storage for Polkadot wallet connection status on component mount
    const polkadotConnected = localStorage.getItem('polkadotWalletConnected') === 'true';
    setPolkadotWalletConnected(polkadotConnected);
  }, []);

  const handlePolkadotWalletConnection = (connected: any) => {
    setPolkadotWalletConnected(connected);
    localStorage.setItem('polkadotWalletConnected', connected.toString());
  };

  return (
    <TxBuilderLayout blockchain={blockchain}>
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
              {polkadotBalanceLoaded && polkadotWalletConnected && <PolkadotTxBuilder />}
            </>
          ) : (
            <>
              <CardanoWalletConnect />
              <CardanoTxBuilder />
            </>
          )}
        </div>
      </div>
    </TxBuilderLayout>
  );
}