// hooks/usePolkadotWallet.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { initPolkadotExtension, enableExtension, getAccounts } from '../utils/polkadot/polkadotExtensionDapp';
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
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    initPolkadotExtension();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setup = async () => {
      console.log('Setting up Polkadot API...');
      setLoading(true);
      try {
        const wsProvider = new WsProvider(selectedProvider);
        console.log('WsProvider created');
        const api = await ApiPromise.create({ provider: wsProvider });
        console.log('ApiPromise created');
        const decimals = api.registry.chainDecimals[0];
        console.log('Token decimals:', decimals);
        setTokenDecimals(decimals);
        setApi(api);
        setLoading(false);
        console.log('Polkadot API setup complete');
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
    console.log('Checking for wallet connection...');
    const accounts = await enableAndFetchAccounts();
    if (accounts) {
      console.log('Accounts fetched:', accounts);
      setAccounts(accounts);
      const storedAccount = localStorage.getItem('selectedAccount');
      if (storedAccount && accounts.some((account: any) => account.address === storedAccount)) {
        console.log('Using stored account:', storedAccount);
        setSelectedAccount(storedAccount);
        setTxData((prevTxData) => ({
          ...prevTxData,
          wallet: storedAccount,
        }));
      } else {
        console.log('Using first account:', accounts[0].address);
        const newSelectedAccount = accounts[0].address;
        setSelectedAccount(newSelectedAccount);
        setTxData((prevTxData) => ({
          ...prevTxData,
          wallet: newSelectedAccount,
        }));
        localStorage.setItem('selectedAccount', newSelectedAccount);
      }
      return true;
    } else {
      console.log('No accounts found');
      return false;
    }
  }, [setTxData]);

  useEffect(() => {
    console.log('Wallet connection effect triggered. isConnected:', isConnected);
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
    console.log('Fetching balance...');
    console.log('API:', api ? 'Available' : 'Not available');
    console.log('Selected Account:', selectedAccount);

    if (typeof window === 'undefined') return;

    if (!api || !selectedAccount) {
      console.log('API or selected account not available');
      setBalance('');
      return;
    }

    setLoading(true);
    console.log('Querying account balance...');

    try {
      const { data: { free: balance } }: any = await api.query.system.account(selectedAccount);
      const balanceInPlanck = balance.toBigInt();
      const finalBalance = Number(balanceInPlanck) / 10 ** tokenDecimals;
      console.log('Balance fetched:', finalBalance);
      const formattedBalance = finalBalance.toFixed(4);
      setBalance(formattedBalance);
      setTxData((prevTxData) => ({
        ...prevTxData,
        balance: formattedBalance
      }));
      if (finalBalance && isConnected) {
        checkWalletStatusIfNeeded(finalBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('');
    } finally {
      setLoading(false);
    }
  }, [api, selectedAccount, tokenDecimals, isConnected, setTxData]);

  useEffect(() => {
    console.log('Balance fetch effect triggered.');
    console.log('isConnected:', isConnected);
    console.log('selectedAccount:', selectedAccount);
    console.log('api:', api ? 'Available' : 'Not available');

    if (typeof window !== 'undefined' && isConnected && selectedAccount && api) {
      console.log('Conditions met, fetching balance...');
      fetchBalance();
    } else {
      console.log('Conditions not met for fetching balance');
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

  const signMessage = async (message: string) => {
    if (!selectedAccount) return null;
    const { web3FromSource } = await import('@polkadot/extension-dapp');
    const injector = await web3FromSource(accounts.find(acc => acc.address === selectedAccount)?.meta.source || '');
    const signRaw = injector?.signer?.signRaw;
    if (signRaw) {
      const { signature } = await signRaw({
        address: selectedAccount,
        data: message,
        type: 'bytes'
      });
      return signature;
    }
    return null;
  };

  const authenticate = async () => {
    console.log('Authentication process started');
    if (!selectedAccount) {
      console.log('No selected account, aborting authentication');
      return;
    }
    const message = `Authenticate with your Polkadot account: ${selectedAccount}`;
    console.log('Signing message:', message);
    const signature = await signMessage(message);
    if (!signature) {
      console.log('Failed to sign message, aborting authentication');
      return;
    }
    console.log('Message signed successfully');

    try {
      console.log('Sending authentication request to server');
      const response = await fetch('/api/auth/polkadot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: selectedAccount, signature, message })
      });

      if (response.ok) {
        const { token } = await response.json();
        console.log('Authentication successful, token received');
        setAuthToken(token);
        localStorage.setItem('polkadotAuthToken', token);
        
        setTxData(prevTxData => ({
          ...prevTxData,
          authToken: token
        }));
      } else {
        console.error('Authentication failed', await response.text());
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  const connectWallet = async () => {
    const connected = await checkForWalletConnection();
    if (connected) {
      onConnectionChange(true);
      if (selectedAccount) {
        localStorage.setItem('selectedAccount', selectedAccount);
        await authenticate();
      }
    }
    return connected;
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setAuthToken(null);
    setBalance('');
    localStorage.removeItem('selectedAccount');
    localStorage.removeItem('polkadotAuthToken');
    setTxData(prevTxData => ({
      ...prevTxData,
      wallet: '',
      authToken: null,
      balance: ''
    }));
    onConnectionChange(false);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('polkadotAuthToken');
    if (storedToken) {
      setAuthToken(storedToken);
      setTxData(prevTxData => ({
        ...prevTxData,
        authToken: storedToken
      }));
    }
  }, [setTxData]);

  const handleAccountChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAccount = event.target.value;
    console.log('Account changed to:', newAccount);
    setSelectedAccount(newAccount);
    setTxData((prevTxData) => ({
      ...prevTxData,
      wallet: newAccount,
    }));
    localStorage.setItem('selectedAccount', newAccount);
    if (api) {
      fetchBalance();
    }
  }, [api, setTxData, fetchBalance]);

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
    authToken,
    authenticate,
    isConnected
  };
};