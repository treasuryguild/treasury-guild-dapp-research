// components/PolkadotTransactions.tsx
import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useTxData } from '../../context/TxDataContext';
import { supabaseAnon } from '../../lib/supabaseClient';
import { PROVIDERS, SUBSCAN_URLS } from '../../constants/providers';

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
    const test = api.query.system.events()
    console.log('Test:', test);
    
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
  };

  return (
    <>
      <div>Txs</div>
      <button onClick={fetchBalance}>Fetch Balance</button>
      <p>Balance: {balance}</p>
    </>
  );
}