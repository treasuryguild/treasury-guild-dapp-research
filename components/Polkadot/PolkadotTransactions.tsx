// components/PolkadotTransactions.tsx
import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useTxData } from '../../context/TxDataContext';
import { supabaseAnon } from '../../lib/supabaseClient';
import { PROVIDERS } from '../../constants/providers';

const TESTING_MODE = process.env.NEXT_PUBLIC_TESTING_MODE === 'false';

interface Contribution {
  name: string;
  labels: string[];
  date: string;
  contributors: {
    tokens: {
      token: string;
      amount: string;
    }[];
  }[];
}

export default function PolkadotTransactions() {
  const [wsProvider, setWsProvider] = useState('wss://ws.test.azero.dev');
  const { txData, setTxData } = useTxData();
  const [transactionStatus, setTransactionStatus] = useState('idle');
  const [tokenDecimals, setTokenDecimals] = useState(0);
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].url);
  const [walletAddress, setWalletAddress] = useState('5FmuQEdBC6BZcLWAngpo2owTFyeAWe9xR7LHZwd6kNE8WV5T');

  useEffect(() => {
    const updateProvider = async () => {
      const { provider } = txData;
      if (!provider) {
        console.error('Provider not found in txData');
        return;
      }
      setWsProvider(provider);
    };
    const setup = async () => {
        const { provider } = txData;
        setLoading(true);
        const wsProvider = new WsProvider(provider != '' ? provider : selectedProvider);
        const api = await ApiPromise.create({ provider: wsProvider });
        const decimals = api.registry.chainDecimals[0];
        setTokenDecimals(decimals);
        setApi(api);
        setLoading(false);
      };
  
      setup();
    updateProvider();
  }, [txData]);

  const fetchBalance = async () => {
    const provider = new WsProvider(wsProvider);
    const api = await ApiPromise.create({ provider });
    const decimals = api.registry.chainDecimals[0];
    setTokenDecimals(decimals);

    const storedAccount = localStorage.getItem('selectedAccount');
    if (!api || !storedAccount) {
      setBalance('');
      return;
    }

    api.query.system.account(
      storedAccount,
      ({ data: { free: balance } }: { data: { free: any } }) => {
        const balanceInPlanck = balance.toBigInt();
        const balanceInDOT = balanceInPlanck;
        const finalBalance = Number(balanceInDOT) / 10 ** tokenDecimals;
        setBalance(finalBalance.toFixed(4));
        console.log('Balance:', finalBalance);
      }
    );
    // Get the last block hash
    const lastBlockHash = await api.rpc.chain.getBlockHash();
  
    // Get the block header
    const blockHeader: any = await api.derive.chain.getHeader(lastBlockHash);

    // Get the transaction details
    const signedBlock = await api.rpc.chain.getBlock(lastBlockHash);
    const allRecords: any = await api.query.system.events.at(signedBlock.block.header.hash);
    allRecords.forEach((record: any, index: number) => {
        console.log(`Record ${index}:`, record.event.data[0].toString());
      });
    // Find the relevant transaction record
    const transactionRecord: any = allRecords.find(({ event }: any) =>
        // Modify the condition based on the actual structure and values of the transaction record
        event.section === 'balances' &&
        event.method === 'Transfer' &&
        event.data[1].toString() === walletAddress
      );
    console.log('All records:', allRecords);
      if (transactionRecord) {
        const fromAddress = transactionRecord.event.data[0].toString();
        const amount = transactionRecord.event.data[2].toString();
        console.log('Transaction record:', transactionRecord);
        // Find the corresponding extrinsic for the event
        const transactionEvent = allRecords.find(
          ({ event }: any) =>
            event.section === 'balances' &&
            event.method === 'Transfer' &&
            event.data[0].toString() === fromAddress &&
            event.data[1].toString() === walletAddress &&
            event.data[2].toString() === amount
        );
      
        if (transactionEvent) {
          const transactionIndex = transactionEvent.phase.asApplyExtrinsic.toNumber();
          const transactionExtrinsic = signedBlock.block.extrinsics[transactionIndex];
      
          if (transactionExtrinsic) {
            const transactionHash = transactionExtrinsic.hash.toString();
      
            // Create the JSON object
            const transactionDetails = {
              walletAddress: walletAddress,
              fromAddress,
              amount,
              transactionHash,
              blockNumber: blockHeader.number.toNumber(),
              blockHash: blockHeader.hash.toString(),
              timestamp: blockHeader.timestamp ? new Date(blockHeader.timestamp.toNumber()).toISOString() : new Date().toISOString(),
            };
      
            console.log('Transaction details:', transactionDetails);
      
            // Send transaction details to Netlify function
            //await sendTransactionDetailsToNetlify(transactionDetails);
          } else {
            console.log('Transaction extrinsic not found for the balance change event.');
          }
        } else {
          console.log('Transaction event not found for the balance change event.');
        }
      } else {
        console.log('Transaction record not found for the balance change event.');
      }
  };

  return (
    <>
      <div>Txs</div>
      <button onClick={fetchBalance}>Fetch Balance</button>
      <p>Balance: {balance}</p>
    </>
  );
}