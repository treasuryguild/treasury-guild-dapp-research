// components/PolkadotTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import ContributionFormOptions from '../CollectContributions/ContributionFormOptions';
import { useTxData } from '../../context/TxDataContext';
import handleContributionSubmit from '../../utils/polkadot/handleContributionSubmit';
import { generateBatchCalls } from '../../utils/polkadot/generateBatchCalls';
import { checkWalletBalance } from '../../utils/polkadot/checkWalletBalance';

export default function PolkadotTxBuilder() {
  const [wsProvider, setWsProvider] = useState('wss://ws.test.azero.dev');
  const { txData, setTxData } = useTxData();
  const [transactionStatus, setTransactionStatus] = useState('idle');

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
      {transactionStatus === 'in_progress' ? (
        <div>Transaction in progress...</div>
      ) : (
        <ContributionFormOptions
          onContributionSubmit={(contributions) =>
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
      )}
    </>
  );
}