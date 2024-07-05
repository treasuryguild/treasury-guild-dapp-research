// ../components/WalletDashboard.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PolkadotTransactions from './Polkadot/PolkadotTransactions';
import CardanoTransactions from './Cardano/CardanoTransactions';
import CardanoWalletConnect from './Cardano/CardanoWalletConnect';
import { useTxData } from '../context/TxDataContext';
import styles from '../styles/Dashboard.module.css';

const PolkadotWalletConnect = dynamic(
  () => import('./Polkadot/PolkadotWalletConnect'),
  { ssr: false }
);

interface WalletDashboardProps {
  selectedBlockchain: string;
  polkadotWalletConnected: boolean;
  onPolkadotWalletConnection: (connected: boolean) => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({
  selectedBlockchain,
  polkadotWalletConnected,
  onPolkadotWalletConnection
}) => {
  const { txData } = useTxData();
  const [polkadotBalanceLoaded, setPolkadotBalanceLoaded] = useState(false);

  useEffect(() => {
    const updateProvider = async () => {
      const { provider } = txData;
      if (!provider) {
        console.error('Provider not found in txData');
        return;
      }
      // You might want to use this provider information if needed
      console.log('Current provider:', provider);
    };
    updateProvider();
  }, [txData.provider]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {selectedBlockchain === 'Polkadot' ? (
          <>
            <PolkadotWalletConnect 
              onBalanceLoaded={setPolkadotBalanceLoaded}
              isConnected={polkadotWalletConnected}
              onConnectionChange={onPolkadotWalletConnection}
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
  );
};

export default WalletDashboard;