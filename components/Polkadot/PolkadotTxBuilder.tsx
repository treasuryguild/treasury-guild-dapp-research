// components/PolkadotTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import ContributionForm from '../ContributionForm';
import { useTxData } from '../../context/TxDataContext';
import { supabaseAnon } from '../../lib/supabaseClient';
import { handleSingleTokenContribution } from '../../utils/polkadot/singleTokenContribution';
import { handleMultipleTokensContribution } from '../../utils/polkadot/multipleTokensContribution';
import updateTransactionTables from '../../utils/updateTransactionTables';

const TESTING_MODE = process.env.NEXT_PUBLIC_TESTING_MODE === 'false';

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

  const checkWalletBalance = async (token: { token: string }, requiredAmount: number) => {
    const tokenInfo = txData.tokens.find((t: any) => t.symbol === token.token);

    if (tokenInfo) {
      const { balance, decimals } = tokenInfo as { symbol: string; balance: string; decimals: number };
      const availableBalance = Number(balance) / Math.pow(10, decimals);
      console.log(`Available balance for token ${tokenInfo.symbol}:`, availableBalance);

      if (availableBalance < requiredAmount) {
        alert(`Insufficient balance for token ${tokenInfo.symbol}. Required: ${Number(requiredAmount)}, Available: ${availableBalance}`);
        const errorMessage = `Insufficient balance for token ${tokenInfo.symbol}. Required: ${Number(requiredAmount)}, Available: ${availableBalance}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } else {
      console.warn(`Token data not found for symbol: ${token.token}`);
    }
  };

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

  const generateBatchCalls = async (
    contributions: Contribution[],
    api: ApiPromise,
    decimals: number,
    wallet: string
  ) => {
    const batchCalls: any[] = [];
    let jsonData: any = {
      transactionHash: '',
      blockNumber: 0,
      fromAddress: txData.wallet,
      toAddress: '',
      project_id: txData.project_id,
      blockchain: 'Polkadot',
      group: txData.group,
      success: false,
      fee: '0',
      contributions: [],
    };

    for (const contribution of contributions) {
      const contributionInputs: any[] = [];
      const contributionOutputs: any[] = [];

      for (const contributor of contribution.contributors) {
        if (contributor.tokens.length === 1) {
          await handleSingleTokenContribution(
            contribution,
            contributionInputs,
            contributionOutputs,
            batchCalls,
            jsonData,
            decimals,
            api,
            wallet,
            txData
          );
        } else {
          await handleMultipleTokensContribution(
            contribution,
            contributionInputs,
            contributionOutputs,
            batchCalls,
            jsonData,
            decimals,
            api,
            wallet,
            txData
          );
        }
      }

      jsonData.contributions.push({
        name: contribution.name,
        labels: contribution.labels.split(',').map(label => label.trim()),
        taskDate: contribution.date,
        inputs: contributionInputs,
        outputs: contributionOutputs,
      });
    }

    return { batchCalls, jsonData };
  };

  const handleContributionSubmit = async (contributions: Contribution[]) => {
    if (typeof window === 'undefined') return null;
    const { web3Enable, web3FromAddress } = await import('@polkadot/extension-dapp');
    await web3Enable('Your App Name');
    const injector = await web3FromAddress(txData.wallet);
    if (!injector.signer) {
      console.error('Signer not found. Make sure a wallet extension is installed and the account is accessible.');
      return;
    }

    if (!wsProvider) {
      console.error('Blockchain provider is not set. Please select a provider.');
      return;
    }

    try {
      const provider = new WsProvider(wsProvider);
      const api = await ApiPromise.create({ provider });
      const decimals = api.registry.chainDecimals[0];

      const requiredTokens: { [key: string]: number } = {};

      for (const contribution of contributions) {
        for (const contributor of contribution.contributors) {
          for (const token of contributor.tokens) {
            const tokenKey = token.token;
            requiredTokens[tokenKey] = (Number(requiredTokens[tokenKey]) || 0) + Number(token.amount);
          }
        }
      }

      for (const [tokenKey, requiredAmount] of Object.entries(requiredTokens)) {
        const token = { token: tokenKey };
        await checkWalletBalance(token, requiredAmount);
      }

      const { batchCalls, jsonData } = await generateBatchCalls(contributions, api, decimals, txData.wallet);

      setTransactionStatus('in_progress');
      const batch = api.tx.utility.batchAll(batchCalls);
      const tx = batch;
      const unsub = await batch.signAndSend(txData.wallet, { signer: injector.signer }, async ({ events = [], status }) => {
        if (status.isInBlock) {
          console.log('Transaction included at block hash', status.asInBlock.toHex());
          console.log('Waiting for finalization...');
        } else if (status.isFinalized) {
          console.log('Transaction finalized at block hash', status.asFinalized.toHex());
          
          const signedBlock = await api.rpc.chain.getBlock(status.asFinalized);
          const extrinsicIndex = signedBlock.block.extrinsics.findIndex(
            (ex) => ex.hash.toHex() === tx.hash.toHex()
          );
          const extrinsicHash = signedBlock.block.extrinsics[extrinsicIndex].hash.toHex();
          
          jsonData.transactionHash = extrinsicHash;
          jsonData.success = true;
          jsonData.tx_type = 'Outgoing';
        }

        events.forEach(({ phase, event: { data, method, section } }) => {
          if (section === 'transactionPayment' && method === 'TransactionFeePaid') {
            jsonData.fee = data[1].toString();
          }
        });

        if (status.isFinalized) {
          if (TESTING_MODE) {
            try {
              await updateTransactionTables(jsonData);
              console.log('Transaction tables updated successfully');
            } catch (error) {
              console.error('Error updating transaction tables:', error);
            }
          } else {
            const { data, error } = await supabaseAnon.from('pending_transactions').insert([{ json_data: jsonData, hash: jsonData.transactionHash}]);

            if (error) {
              console.error('Error inserting pending transaction:', error);
            } else {
              console.log('Pending transaction inserted successfully');
            }
          }
          setTransactionStatus('idle');
          unsub();
        }
      });
    } catch (error) {
      console.error('An error occurred while submitting the transaction:', error);
      setTransactionStatus('idle');
    }
  };

  return (
    <>
      {transactionStatus === 'in_progress' ? (
        <div>Transaction in progress...</div>
      ) : (
        <ContributionForm onSubmit={handleContributionSubmit} tokens={txData.tokens} />
      )}
    </>
  );
}