// components/WalletDashboard.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import PolkadotTransactions from './Polkadot/PolkadotTransactions';
import CardanoTransactions from './Cardano/CardanoTransactions';
import CardanoWalletConnect from './Cardano/CardanoWalletConnect';
import { useWallet } from '../context/WalletContext';
import styles from '../styles/Dashboard.module.css';

const PolkadotWalletConnect = dynamic(
  () => import('./Polkadot/PolkadotWalletConnect'),
  { ssr: false }
);

const WalletDashboard: React.FC = () => {
  const { selectedBlockchain, polkadotWallet, cardanoWallet } = useWallet();
  const { isConnected: isPolkadotConnected, balance: polkadotBalance } = polkadotWallet;
  const { connected: isCardanoConnected } = cardanoWallet;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {selectedBlockchain === 'Polkadot' ? (
          <>
            <PolkadotWalletConnect />
            {isPolkadotConnected && polkadotBalance && <PolkadotTransactions />}
          </>
        ) : (
          <>
            <CardanoWalletConnect />
            {isCardanoConnected && <CardanoTransactions />}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;