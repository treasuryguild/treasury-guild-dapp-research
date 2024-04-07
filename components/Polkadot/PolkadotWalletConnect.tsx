// components/PolkadotWalletConnect.tsx
import React, { useState, useEffect } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useTxData } from '../../context/TxDataContext';
import ProjectDetailsForm from '../../components/ProjectDetailsForm';
import { fetchTokenBalances } from '../../utils/polkadot/fetchTokenBalances';
import { updateTokensTable } from '../../utils/updateTokensTable';
import { PROVIDERS } from '../../constants/providers';

const PolkadotWalletConnect: React.FC = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Not connected');
  const [api, setApi] = useState<ApiPromise | null>(null);
  const { txData, setTxData } = useTxData();
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].url);
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenDecimals, setTokenDecimals] = useState(0);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const setup = async () => {
      setLoading(true);
      const wsProvider = new WsProvider(selectedProvider);
      const api = await ApiPromise.create({ provider: wsProvider });
      const decimals = api.registry.chainDecimals[0];
      setTokenDecimals(decimals);
      setApi(api);
      setLoading(false);
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
    const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
    const extensions = await web3Enable('Your App Name');
    if (extensions.length === 0) return null;
    const accounts = await web3Accounts();
    return accounts.length > 0 ? accounts : null;
  };

  const checkForWalletConnection = async () => {
    const isDisconnected = localStorage.getItem('isWalletDisconnected') === 'true';
    if (isDisconnected) {
      setStatus('Not connected');
      return;
    }
  
    const accounts = await enableAndFetchAccounts();
    if (accounts) {
      setAccounts(accounts);
      setStatus('Connected');
      const storedAccount = localStorage.getItem('selectedAccount');
      if (storedAccount && accounts.some((account) => account.address === storedAccount)) {
        setSelectedAccount(storedAccount);
        setTxData((prevTxData) => ({
          ...prevTxData,
          wallet: storedAccount,
        }));
      } else {
        setSelectedAccount(accounts[0].address);
        setTxData((prevTxData) => ({
          ...prevTxData,
          wallet: accounts[0].address,
        }));
      }
    } else {
      setStatus('Not connected');
    }
  };

  useEffect(() => {
    if (txData.wallet === '') {
      checkForWalletConnection();
    }
  }, [txData.wallet]);

  const fetchBalance = async () => {
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

  useEffect(() => {
    fetchBalance();
  }, [selectedAccount, api]);

  const fetchAndSetTokens = async () => {
    if (selectedAccount && api) {
      const fetchedTokens: any = await fetchTokenBalances(api, selectedAccount, selectedProvider);
      setTokens(fetchedTokens);
      await updateTokensTable(fetchedTokens);
    }
  };

  useEffect(() => {
    fetchAndSetTokens();
  }, [selectedAccount, api]);

  useEffect(() => {
    setTxData((prevTxData) => ({
      ...prevTxData,
      tokens
    }));
  }, [tokens, setTxData]);

  const connectPolkadotWallet = async () => {
    setStatus('Connecting...');
    const accounts = await enableAndFetchAccounts();
    if (accounts) {
      setAccounts(accounts);
      setStatus('Connected');
      setSelectedAccount(accounts[0].address);
      setTxData((prevTxData) => ({
        ...prevTxData,
        wallet: accounts[0].address
      }));
      localStorage.removeItem('isWalletDisconnected');
    } else {
      setStatus('No extension found or access denied');
    }
  };

  const disconnectPolkadotWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setTxData((prevTxData) => ({
      ...prevTxData,
      wallet: '',
    }));
    setStatus('Not connected');
    localStorage.setItem('isWalletDisconnected', 'true');
    localStorage.removeItem('selectedAccount');
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

  return (
    <div>
      <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}>
        {PROVIDERS.map((provider, index) => (
          <option key={index} value={provider.url}>{provider.name}</option>
        ))}
      </select>
      {status !== 'Connected' ? (
        <button onClick={connectPolkadotWallet}>Connect Polkadot Wallet</button>
      ) : (
        <>
          <button onClick={disconnectPolkadotWallet}>Disconnect Polkadot Wallet</button>
          <select value={selectedAccount || ''} onChange={handleAccountChange}>
            {accounts.map((account) => (
              <option key={account.meta.name + account.meta.source} value={account.address}>
                {account.meta.name + " " + account.meta.source}
              </option>
            ))}
          </select>
        </>
      )}
      <p>Status: {status}</p>
      {accounts.length > 0 && (
        <div>
          {selectedAccount && (
            <ProjectDetailsForm walletAddress={selectedAccount} blockchain="Polkadot" />
          )}
          <h4>Balance</h4>
          <div>
            <p>Account Address: {selectedAccount}</p>
            <p>Balance: {loading ? 'Loading...' : balance}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolkadotWalletConnect;