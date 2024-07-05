// hooks/usePolkadotWallet.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { enableExtension, getAccounts } from '../utils/polkadot/polkadotExtensionDapp';
import { useTxData } from '../context/TxDataContext';
import { fetchTokenBalances } from '../utils/polkadot/fetchTokenBalances';
import { checkWalletStatus } from '../utils/polkadot/checkWalletStatus';
import { updateTokensTable } from '../utils/updateTokensTable';
import { PROVIDERS } from '../constants/providers';

export const usePolkadotWallet = (isConnected: boolean, onConnectionChange: (connected: boolean) => void) => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const { txData, setTxData } = useTxData();
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].url);
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenDecimals, setTokenDecimals] = useState(0);
  const [tokens, setTokens] = useState([]);
  const walletStatusChecked = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setup = async () => {
        console.log('Setting up Polkadot API...'); // Debug log
        setLoading(true);
        try {
          const wsProvider = new WsProvider(selectedProvider);
          console.log('WsProvider created'); // Debug log
          const api = await ApiPromise.create({ provider: wsProvider });
          console.log('ApiPromise created'); // Debug log
          const decimals = api.registry.chainDecimals[0];
          console.log('Token decimals:', decimals); // Debug log
          setTokenDecimals(decimals);
          setApi(api);
          setLoading(false);
          console.log('Polkadot API setup complete'); // Debug log
        } catch (error) {
          console.error('Error setting up Polkadot API:', error);
          setLoading(false);
        }
      };
  
      setup();
    }, [selectedProvider]);

  useEffect(() => {
    setTxData((prevTxData) => ({
      ...prevTxData,
      provider: selectedProvider
    }));
  }, [selectedProvider, setTxData]);

  const enableAndFetchAccounts = async () => {
    if (typeof window === 'undefined') return null;

    try {
      await enableExtension('Your App Name');
      const accounts = await getAccounts();
      return accounts.length > 0 ? accounts : null;
    } catch (error) {
      console.error('Error enabling and fetching accounts:', error);
      return null;
    }
  };

  const checkForWalletConnection = useCallback(async () => {
    console.log('Checking for wallet connection...'); // Debug log
    const accounts = await enableAndFetchAccounts();
    if (accounts) {
      console.log('Accounts fetched:', accounts); // Debug log
      setAccounts(accounts);
      const storedAccount = localStorage.getItem('selectedAccount');
      if (storedAccount && accounts.some((account: any) => account.address === storedAccount)) {
        console.log('Using stored account:', storedAccount); // Debug log
        setSelectedAccount(storedAccount);
        setTxData((prevTxData) => ({
          ...prevTxData,
          wallet: storedAccount,
        }));
      } else {
        console.log('Using first account:', accounts[0].address); // Debug log
        setSelectedAccount(accounts[0].address);
        setTxData((prevTxData) => ({
          ...prevTxData,
          wallet: accounts[0].address,
        }));
      }
      return true;
    } else {
      console.log('No accounts found'); // Debug log
      return false;
    }
  }, [setTxData]);

  useEffect(() => {
    console.log('Wallet connection effect triggered. isConnected:', isConnected); // Debug log
    if (isConnected) {
      checkForWalletConnection();
    } else {
      disconnectWallet();
    }
  }, [isConnected, checkForWalletConnection]);

  const checkWalletStatusIfNeeded = async (finalBalance: any) => {
    if (selectedAccount && api) {
      const key = `${selectedAccount}-${selectedProvider}-${finalBalance}`;
      if (!walletStatusChecked.current[key]) {
        walletStatusChecked.current[key] = true;
        await checkWalletStatus(api, selectedAccount, selectedProvider);
      }
    }
  };

  const fetchBalance = useCallback(async () => {
    console.log('Fetching balance...'); // Debug log
    console.log('API:', api ? 'Available' : 'Not available'); // Debug log
    console.log('Selected Account:', selectedAccount); // Debug log

    if (typeof window === 'undefined') return;

    if (!api || !selectedAccount) {
      console.log('API or selected account not available'); // Debug log
      setBalance('');
      return;
    }

    console.log('Querying account balance...'); // Debug log

    try {
      const { data: { free: balance } }: any = await api.query.system.account(selectedAccount);
      const balanceInPlanck = balance.toBigInt();
      const balanceInDOT = balanceInPlanck;
      const finalBalance = Number(balanceInDOT) / 10 ** tokenDecimals;
      console.log('Balance fetched:', finalBalance); // Debug log
      setBalance(finalBalance.toFixed(4));
      if (finalBalance && isConnected) {
        checkWalletStatusIfNeeded(finalBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [api, selectedAccount, tokenDecimals, isConnected]);

  useEffect(() => {
    console.log('Balance fetch effect triggered.'); // Debug log
    console.log('isConnected:', isConnected); // Debug log
    console.log('selectedAccount:', selectedAccount); // Debug log
    console.log('api:', api ? 'Available' : 'Not available'); // Debug log

    if (typeof window !== 'undefined' && isConnected && selectedAccount && api) {
      console.log('Conditions met, fetching balance...'); // Debug log
      fetchBalance();
    } else {
      console.log('Conditions not met for fetching balance'); // Debug log
    }
  }, [isConnected, selectedAccount, api, fetchBalance]);

  const fetchAndSetTokens = useCallback(async () => {
    if (typeof window !== 'undefined' && selectedAccount && api) {
      const fetchedTokens: any = await fetchTokenBalances(api, selectedAccount, selectedProvider);
      setTokens(fetchedTokens);
      await updateTokensTable(fetchedTokens);
    }
  }, [api, selectedAccount, selectedProvider]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isConnected) {
      fetchAndSetTokens();
    }
  }, [selectedAccount, api, fetchAndSetTokens, isConnected]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTxData((prevTxData) => ({
        ...prevTxData,
        tokens
      }));
    }
  }, [tokens, setTxData]);

  const connectWallet = async () => {
    const connected = await checkForWalletConnection();
    onConnectionChange(connected);
    return connected;
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setTxData((prevTxData) => ({
      ...prevTxData,
      wallet: '',
    }));
    localStorage.removeItem('selectedAccount');
    onConnectionChange(false);
  };

  const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAccount = event.target.value;
    setSelectedAccount(newAccount);
    setTxData((prevTxData) => ({
      ...prevTxData,
      wallet: newAccount,
    }));
    localStorage.setItem('selectedAccount', newAccount);
  };

  return {
    accounts,
    selectedAccount,
    api,
    selectedProvider,
    balance,
    loading,
    tokens,
    setSelectedProvider,
    handleAccountChange,
    connectWallet,
    disconnectWallet,
    PROVIDERS,
    isConnected
  };
};