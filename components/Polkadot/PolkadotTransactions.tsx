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
  const [walletBalance, setWalletBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].url);
  const [errorMessage, setErrorMessage] = useState('');

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
      const wsProvider = new WsProvider(provider !== '' ? provider : selectedProvider);
      const api = await ApiPromise.create({ provider: wsProvider });
      setApi(api);
      setLoading(false);
    };

    setup();
    updateProvider();
  }, [txData]);
  
  async function fetchTransactionDetails(address: string) {
    console.log('Fetching transaction details for address:', address);
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
    setIsLoading(true);
    setErrorMessage('');
    console.log('Starting fetchBalance');
    try {
      let provider;
      try {
        provider = new WsProvider(wsProvider);
        console.log('Provider created');
      } catch (error) {
        console.error('Error creating WebSocket provider:', error);
        setErrorMessage('Failed to connect to the network. Please try again later.');
        return;
      }

      const api = await ApiPromise.create({ provider });
      console.log('API created');

      const decimals = api.registry.chainDecimals[0];
      console.log('Decimals:', decimals);

      const events = await api.query.system.events();
      console.log('Events:', events.toHuman());

      const storedAccount = localStorage.getItem('selectedAccount');
      console.log('Stored account:', storedAccount);
      if (!storedAccount) {
        console.error('No account found');
        setErrorMessage('No account selected. Please select an account first.');
        return;
      }

      if (!api) {
        console.error('API not initialized');
        setErrorMessage('Failed to initialize the API. Please try again later.');
        return;
      }

      const { data: { free: balance } }: any = await api.query.system.account(storedAccount);
      const balanceInPlanck = balance.toBigInt();
      const balanceInDOT = balanceInPlanck;
      const finalBalance = Number(balanceInDOT) / 10 ** decimals;
      setWalletBalance(finalBalance.toFixed(4));
      console.log('Balance:', finalBalance);

      const transactions = await fetchTransactionDetails(storedAccount);
      console.log('Fetched transactions:', transactions);
    } catch (error) {
      console.error('Error in fetchBalance:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        setErrorMessage(`An error occurred: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>Txs</div>
      <button onClick={fetchBalance} disabled={isLoading}>
        {isLoading ? 'Fetching...' : 'Fetch Balance'}
      </button>
      <p>Balance: {walletBalance}</p>
      {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
    </>
  );
}