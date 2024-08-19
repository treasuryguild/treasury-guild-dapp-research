// components/Polkadot/PolkadotTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import ContributionFormOptions from '../CollectContributions/ContributionFormOptions';
import { usePolkadotData } from '../../context/PolkadotContext';
import { useWallet } from '../../context/WalletContext';
import handleContributionSubmit from '../../utils/polkadot/handleContributionSubmit';
import { generateBatchCalls } from '../../utils/polkadot/generateBatchCalls';
import { checkWalletBalance } from '../../utils/polkadot/checkWalletBalance';

export default function PolkadotTxBuilder() {
  const [wsProvider, setWsProvider] = useState('wss://ws.test.azero.dev');
  const { polkadotData, setPolkadotData } = usePolkadotData();
  const [transactionStatus, setTransactionStatus] = useState('idle');
  const { supabaseAuthClient } = useWallet();

  useEffect(() => {
    const updateProvider = async () => {
      const { provider } = polkadotData;
      if (!provider) {
        console.error('Provider not found in txData');
        return;
      }

      setWsProvider(provider);
    };
    updateProvider();
  }, [polkadotData]);

  console.log("polkadotData", polkadotData, supabaseAuthClient);
  
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
              polkadotData,
              (contributions, api, decimals, wallet) => generateBatchCalls(contributions, api, decimals, wallet, polkadotData),
              (token, requiredAmount) => checkWalletBalance(token, requiredAmount, polkadotData.tokens),
              setTransactionStatus,
              supabaseAuthClient
            )
          }
          tokens={polkadotData.tokens}
        />
      )}
    </>
  );
}