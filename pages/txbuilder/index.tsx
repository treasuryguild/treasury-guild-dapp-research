// pages/txbuilder/index.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import TxBuilderLayout from '../../layouts/TxBuilderLayout';
import styles from '../../styles/TxBuilder.module.css';
import { useWallet } from '../../context/WalletContext';
import PolkadotWalletConnect from '../../components/Polkadot/PolkadotWalletConnect';

const PolkadotTxBuilder = dynamic(
  () => import('../../components/Polkadot/PolkadotTxBuilder'),
  { ssr: false }
);

const CardanoTxBuilder = dynamic(
  () => import('../../components/Cardano/CardanoTxBuilder'),
  { ssr: false }
);

export default function TxBuilder() {
  const { selectedBlockchain, polkadotWallet, cardanoWallet } = useWallet();

  const { isConnected: isPolkadotConnected, balance: polkadotBalance } = polkadotWallet;
  const { connected: isCardanoConnected } = cardanoWallet;

  return (
    <TxBuilderLayout blockchain={selectedBlockchain}>
      <div className={styles.container}>
        <div className={styles.content}>
          {selectedBlockchain === 'Polkadot' ? (
            <>
              <PolkadotWalletConnect />
              {isPolkadotConnected && polkadotBalance && <PolkadotTxBuilder />}
            </>
          ) : (
            <>
              {isCardanoConnected && <CardanoTxBuilder />}
            </>
          )}
        </div>
      </div>
    </TxBuilderLayout>
  );
}