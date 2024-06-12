// pages/transactions/index.tsx
import React, { useState, useEffect } from 'react';
import TxLayout from '../../layouts/TxLayout';
import PolkadotTransactions from '../../components/Polkadot/PolkadotTransactions';
import CardanoTransactions from '../../components/Cardano/CardanoTransactions';
import PolkadotWalletConnect from '../../components/Polkadot/PolkadotWalletConnect';
import CardanoWalletConnect from '../../components/Cardano/CardanoWalletConnect';
import { useTxData } from '../../context/TxDataContext';
import styles from '../../styles/TxBuilder.module.css';

export default function Transactions() {
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
    <TxLayout blockchain={blockchain}>
      <div className={styles.container}>
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={() => setBlockchain('Polkadot')}>Polkadot</button>
          <button className={styles.button} onClick={() => setBlockchain('Cardano')}>Cardano</button>
        </div>
        <div className={styles.content}>
          {blockchain === 'Polkadot' ? (
            <>
              <PolkadotWalletConnect onBalanceLoaded={setBalanceLoaded} />
              {balanceLoaded && <PolkadotTransactions />}
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