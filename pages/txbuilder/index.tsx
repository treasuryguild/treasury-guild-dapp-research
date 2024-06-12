// pages/txbuilder/index.tsx
import React, { useState, useEffect } from 'react';
import TxBuilderLayout from '../../layouts/TxBuilderLayout';
import PolkadotTxBuilder from '../../components/Polkadot/PolkadotTxBuilder';
import CardanoTxBuilder from '../../components/Cardano/CardanoTxBuilder';
import PolkadotWalletConnect from '../../components/Polkadot/PolkadotWalletConnect';
import CardanoWalletConnect from '../../components/Cardano/CardanoWalletConnect';
import { useTxData } from '../../context/TxDataContext';
import styles from '../../styles/TxBuilder.module.css';

export default function TxBuilder() {
  const [blockchain, setBlockchain] = useState('Polkadot');
  const { txData, setTxData } = useTxData();
  const [wsProvider, setWsProvider] = useState('');
  const [balanceLoaded, setBalanceLoaded] = useState(false);

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
  }, [txData.provider]);

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