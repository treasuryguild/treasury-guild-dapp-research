import React, { useState } from 'react';
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
  const [balanceLoaded, setBalanceLoaded] = useState(false);

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
              <PolkadotWalletConnect onBalanceLoaded={setBalanceLoaded} />
              {balanceLoaded && <PolkadotTxBuilder />}
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
