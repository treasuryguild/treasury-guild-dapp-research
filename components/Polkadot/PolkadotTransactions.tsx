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
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].url);

  useEffect(() => {
    const updateProvider = async () => {
      const { provider } = txData;
      if (!provider) {
        console.error('Provider not found in txData');
        return;
      }
      setWsProvider(provider);
      setSelectedProvider(provider);
    };
    const setup = async () => {
      const { provider } = txData;
      setLoading(true);
      const wsProvider = new WsProvider(provider != '' ? provider : selectedProvider);
      const api = await ApiPromise.create({ provider: wsProvider });
      setApi(api);
      setLoading(false);
    };

    setup();
    updateProvider();
  }, [txData]);
  
  async function fetchTransactionDetails(address: string) {
    const selectedProviderName = PROVIDERS.find((provider) => provider.url === selectedProvider)?.name || '';
    const subscanUrl = SUBSCAN_URLS.find((subscan) => subscan.name === selectedProviderName)?.url || '';

    if (!subscanUrl) {
      console.log('No Subscan URL found for the selected provider.');
      return [];
    }

    const apiUrl = `${subscanUrl}/api/v2/scan/transfers`;
    const params = {
      address: address,
      row: 10,
      page: 0,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Data:', data);
      if (data && data.data && data.data.transfers && data.data.transfers.length > 0) {
        // Sort the transfers by timestamp in descending order
        const sortedTransfers = data.data.transfers.sort((a: any, b: any) => b.block_timestamp - a.block_timestamp);
        console.log('Sorted Transfers:', sortedTransfers);
        return sortedTransfers;
      }
    }

    return [];
  }

  const fetchBalance = async () => {
    const provider = new WsProvider(wsProvider);
    const api = await ApiPromise.create({ provider });
    const decimals = api.registry.chainDecimals[0];
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
        const finalBalance = Number(balanceInDOT) / 10 ** decimals;
        setBalance(finalBalance.toFixed(4));
        console.log('Balance:', finalBalance);
      }
    ); 

    fetchTransactionDetails(storedAccount);
  };

  return (
    <>
      <div>Txs</div>
      <button onClick={fetchBalance}>Fetch Balance</button>
      <p>Balance: {balance}</p>
    </>
  );
}