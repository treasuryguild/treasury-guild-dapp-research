// components/PolkadotTxBuilder.tsx
import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import ContributionForm from '../ContributionForm';
import { useTxData } from '../../context/TxDataContext';
import updateTransactionTables from '../../utils/updateTransactionTables';

export default function PolkadotTxBuilder() {
  const [accountAddress, setAccountAddress] = useState('');
  const [wsProvider, setWsProvider] = useState('wss://ws.test.azero.dev');
  const { txData, setTxData } = useTxData();
  const { tokens } = txData;

  useEffect(() => {
    // Update the provider when it changes
    const updateProvider = async () => {
      const { provider } = txData;
      console.log('Provider:', provider);
      if (!provider) {
        console.error('Provider not found in txData');
        return;
      }

      setWsProvider(provider);
    };
    updateProvider();
  }, [txData.provider]);

  useEffect(() => {
    // Initialize or update the account address based on the wallet info from txData
    const initOrUpdateAccount = async () => {
      if (typeof window === 'undefined') return null;
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
      const { wallet } = txData; // Destructuring to get the wallet address
      await web3Enable('Your App Name');
      const accounts = await web3Accounts();
      // Check if the wallet address exists and is among the fetched accounts, then set it
      if (wallet && accounts.some(acc => acc.address === wallet)) {
        setAccountAddress(wallet);
      }
    };
    initOrUpdateAccount();
  }, [txData.wallet]);

  const handleContributionSubmit = async (contributions: any) => {
    console.log('Submitting contributions:', contributions);
    // Check if the web3 extension is enabled and the accounts are accessible
    if (typeof window === 'undefined') return null;
    const { web3Enable, web3FromAddress } = await import('@polkadot/extension-dapp');
    await web3Enable('Your App Name');
    const injector = await web3FromAddress(accountAddress);
    if (!injector.signer) {
      alert('Signer not found. Make sure a wallet extension is installed and the account is accessible.');
      return;
    }

    // Check if a valid wsProvider is set
    if (!wsProvider || wsProvider === '') {
      alert('Blockchain provider is not set. Please select a provider.');
      return;
    }

    try {
      const provider = new WsProvider(wsProvider);
      const api = await ApiPromise.create({ provider });
      const decimals = api.registry.chainDecimals[0];

      // Generate batch calls and JSON data for each contribution
      const batchCalls: any[] = [];
      let jsonData: any = {
        transactionHash: '',
        blockNumber: 0,
        fromAddress: accountAddress,
        toAddress: '',
        project_id: txData.project_id,
        blockchain: 'Polkadot',
        group: txData.group,
        success: false,
        fee: '0',
        contributions: []
      };

      for (const contribution of contributions) {
        const contributionInputs: any[] = [];
        const contributionOutputs: any[] = [];

        for (const contributor of contribution.contributors) {
          let amount = contributor.tokens[0].amount;
          const finalAmount = BigInt(amount) * BigInt(10 ** decimals);
          const transferCall = api.tx.balances.transferAllowDeath(contributor.walletAddress, finalAmount);
          const contributorId = contributor.walletAddress.slice(-6);
          const tokenData = txData.tokens.find(token => token.symbol === contributor.tokens[0].token);
          const remarkData = {
            Contribution: contribution.name,
            Role: contributor.role.split(',').map((label: any) => label.trim()),
            Labels: contribution.labels.split(',').map((label: any) => label.trim()),
            Date: contribution.date,
            Tokens: [{ token: contributor.tokens[0], amount: amount.toString() }],
            ContributorId: contributorId,
          };

          const remarkMessage = JSON.stringify(remarkData);
          const remarkCall = api.tx.system.remark(remarkMessage);

          batchCalls.push(transferCall);
          batchCalls.push(remarkCall);

          contributionInputs.push({
            fromAddress: accountAddress,
            token: tokenData,
            amount: amount.toString()
          });

          contributionOutputs.push({
            toAddress: contributor.walletAddress,
            token: tokenData,
            amount: amount.toString(),
            role: contributor.role.split(',').map((label: any) => label.trim()),
            walletId: null,
            externalWalletId: null
          });
        }

        jsonData.contributions.push({
          name: contribution.name,
          labels: contribution.labels,
          taskDate: contribution.date,
          inputs: contributionInputs,
          outputs: contributionOutputs
        });
      }

      console.log('Batch calls:', batchCalls);
      console.log('JSON data:', jsonData);

      // Send the batch transaction
      const batch = api.tx.utility.batchAll(batchCalls);
      const unsub = await batch.signAndSend(accountAddress, { signer: injector.signer }, async ({ events = [], status }) => {
        if (status.isInBlock) {
          console.log(`Transaction included in block with hash: ${status.asInBlock.toString()}`);
          jsonData.transactionHash = status.asInBlock.toString();
          jsonData.blockNumber = '';
        } else if (status.isFinalized) {
          console.log(`Transaction finalized with status: ${status.type}`);
          jsonData.transactionHash = status.asFinalized.toString();
          jsonData.blockNumber = '';
          jsonData.success = true;
        }

        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString());
          if (section === 'transactionPayment' && method === 'TransactionFeePaid') {
            jsonData.fee = data[1].toString();
            console.log('Transaction fee:', jsonData.fee);
          }
        });

        if (status.isFinalized) {
          console.log('Final JSON data:', jsonData);
          // Update the Supabase tables with the transaction data
          await updateTransactionTables(jsonData);
          unsub();
        }
      });
    } catch (error) {
      console.error('An error occurred while submitting the transaction:', error);
      alert('An error occurred. Please check the console for more details.');
    }
  };

  return (
    <>
      <ContributionForm onSubmit={handleContributionSubmit} tokens={tokens} />
    </>
  );
};