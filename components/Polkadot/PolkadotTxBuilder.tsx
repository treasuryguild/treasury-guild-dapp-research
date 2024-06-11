// components/PolkadotTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import ContributionForm from '../ContributionForm';
import UploadJson from './UploadJson';
import { useTxData } from '../../context/TxDataContext';
import handleContributionSubmit from '../../utils/polkadot/handleContributionSubmit';
import { generateBatchCalls } from '../../utils/polkadot/generateBatchCalls';
import { checkWalletBalance } from '../../utils/polkadot/checkWalletBalance';

interface Contribution {
  name: string;
  labels: string;
  date: string;
  contributors: {
    tokens: {
      token: string;
      amount: string;
    }[];
  }[];
}

export default function PolkadotTxBuilder() {
  const [wsProvider, setWsProvider] = useState('wss://ws.test.azero.dev');
  const { txData, setTxData } = useTxData();
  const [transactionStatus, setTransactionStatus] = useState('idle');
  const [activeForm, setActiveForm] = useState('contribution');

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
  }, [txData]);

  return (
    <>
      <div>
        <button onClick={() => setActiveForm('contribution')}>Contribution Form</button>
        <button onClick={() => setActiveForm('uploadJson')}>Upload JSON</button>
      </div>
      {transactionStatus === 'in_progress' ? (
        <div>Transaction in progress...</div>
      ) : activeForm === 'contribution' ? (
        <ContributionForm
          onSubmit={(contributions: any) =>
            handleContributionSubmit(
              contributions,
              wsProvider,
              txData,
              (contributions, api, decimals, wallet) => generateBatchCalls(contributions, api, decimals, wallet, txData),
              (token, requiredAmount) => checkWalletBalance(token, requiredAmount, txData.tokens),
              setTransactionStatus
            )
          }
          tokens={txData.tokens}
        />
      ) : (
        <UploadJson
          onSubmit={(contributions) =>
            handleContributionSubmit(
              contributions,
              wsProvider,
              txData,
              (contributions, api, decimals, wallet) => generateBatchCalls(contributions, api, decimals, wallet, txData),
              (token, requiredAmount) => checkWalletBalance(token, requiredAmount, txData.tokens),
              setTransactionStatus
            )
          }
        />
      )}
    </>
  );
}