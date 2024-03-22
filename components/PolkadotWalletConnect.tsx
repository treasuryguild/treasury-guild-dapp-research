import React, { useState, useEffect } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const PolkadotWalletConnect: React.FC = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null); // State to hold the selected account
  const [status, setStatus] = useState<string>('Not connected');
  const [api, setApi] = useState<ApiPromise | null>(null);

  useEffect(() => {
    const setup = async () => {
      const wsProvider = new WsProvider('wss://rpc.polkadot.io');
      const api = await ApiPromise.create({ provider: wsProvider });
      setApi(api);
    };
    setup();
  }, []);

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
        setSelectedAccount(accounts[0].address); // Automatically select the first account
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
      setSelectedAccount(accounts[0].address); // Automatically select the first account
      localStorage.removeItem('isWalletDisconnected');
    } else {
      setStatus('No extension found or access denied');
    }
  };

  const disconnectPolkadotWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setStatus('Not connected');
    localStorage.setItem('isWalletDisconnected', 'true');
  };

  const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(event.target.value);
  };

  return (
    <div>
      {status !== 'Connected' ? (
        <button onClick={connectPolkadotWallet}>Connect Polkadot Wallet</button>
      ) : (
        <>
          <button onClick={disconnectPolkadotWallet}>Disconnect Polkadot Wallet</button>
          <select value={selectedAccount || ''} onChange={handleAccountChange}>
            {accounts.map((account) => (
              <option key={account.address+account.meta.source} value={account.address}>
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
          {accounts.map((account, index) => (
            <div key={index}>{account.address}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PolkadotWalletConnect;
