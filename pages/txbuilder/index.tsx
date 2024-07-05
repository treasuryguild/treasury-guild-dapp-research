// pages/txbuilder/index.tsx
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

export default function TxBuilder({ selectedBlockchain, polkadotWalletConnected, onPolkadotWalletConnection }: { selectedBlockchain: string, polkadotWalletConnected: boolean, onPolkadotWalletConnection: (connected: boolean) => void }) {
  const [polkadotBalanceLoaded, setPolkadotBalanceLoaded] = useState(false);

  return (
    <TxBuilderLayout blockchain={selectedBlockchain}>
      <div className={styles.container}>
        <div className={styles.content}>
          {selectedBlockchain === 'Polkadot' ? (
            <>
              <PolkadotWalletConnect 
                onBalanceLoaded={setPolkadotBalanceLoaded} 
                isConnected={polkadotWalletConnected}
                onConnectionChange={onPolkadotWalletConnection}
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