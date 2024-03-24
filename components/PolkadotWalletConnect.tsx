// components/PolkadotWalletConnect.tsx
import React, { useState, useEffect } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useTxData } from '../context/TxDataContext';

const providers = [
  { name: 'Aleph Zero Testnet', url: 'wss://ws.test.azero.dev' },
  { name: 'Polkadot Mainnet', url: 'wss://rpc.polkadot.io' },
  // Add more providers as needed
];

const PolkadotWalletConnect: React.FC = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null); // State to hold the selected account
  const [status, setStatus] = useState<string>('Not connected');
  const [api, setApi] = useState<ApiPromise | null>(null);
  const { txData, setTxData } = useTxData();
  const [selectedProvider, setSelectedProvider] = useState(providers[0].url); // Default to the first provider

  useEffect(() => {
    const setup = async () => {
      const wsProvider = new WsProvider(selectedProvider);
      const api = await ApiPromise.create({ provider: wsProvider });
      setApi(api);
      console.log(api, selectedProvider )
    };
    setup();
  }, []);

  useEffect(() => {
    setTxData({ ...txData, provider: selectedProvider });

    console.log("txData");
  }, [selectedProvider]);

  useEffect(() => {
    if (!api) return;

    (async () => {
      const time = await api.query.timestamp.now();
      console.log(`Last timestamp: ${time.toPrimitive() as String}`);
    })();

    return () => {
      api.disconnect();
    };
  }, [api]);

  const enableAndFetchAccounts = async () => {
    if (typeof window === 'undefined') return null;
    const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
    const extensions = await web3Enable('Your App Name');
    if (extensions.length === 0) return null;
    const accounts = await web3Accounts();
    return accounts.length > 0 ? accounts : null;
  };

  useEffect(() => {
    const checkForWalletConnection = async () => {
      const isDisconnected = localStorage.getItem('isWalletDisconnected') === 'true';
      if (isDisconnected) {
        setStatus('Not connected');
        return;
      }

      const accounts = await enableAndFetchAccounts();
      if (accounts) {
        setAccounts(accounts);
        console.log(accounts)
        setStatus('Connected');
        setSelectedAccount(accounts[0].address); 
        setTxData({ ...txData, wallet: accounts[0].address });
      } else {
        setStatus('Not connected');
      }
    };
    checkForWalletConnection();
  }, []);

  const connectPolkadotWallet = async () => {
    setStatus('Connecting...');
    const accounts = await enableAndFetchAccounts();
    if (accounts) {
      setAccounts(accounts);
      setStatus('Connected');
      setSelectedAccount(accounts[0].address); 
      setTxData({ ...txData, wallet: accounts[0].address });
      localStorage.removeItem('isWalletDisconnected');
    } else {
      setStatus('No extension found or access denied');
    }
  };

  const disconnectPolkadotWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setTxData({ ...txData, wallet: '' });
    setStatus('Not connected');
    localStorage.setItem('isWalletDisconnected', 'true');
  };

  const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(event.target.value);
    setTxData({ ...txData, wallet: event.target.value });
    console.log(event.target.value);
  };

  return (
    <div>
      <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}>
        {providers.map((provider, index) => (
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
          <h4>Connected Accounts:</h4>
          {selectedAccount}
          <h4>Balance</h4>
        </div>
      )}
    </div>
  );
};

export default PolkadotWalletConnect;
