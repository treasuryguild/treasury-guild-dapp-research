// components/WalletControls.tsx
import React from 'react';
import { useWallet } from '../context/WalletContext';
import CardanoConnectButton from './Cardano/CardanoConnectButton';
import styles from '../styles/WalletControls.module.css';

const WalletControls: React.FC = () => {
  const { selectedBlockchain, polkadotWallet } = useWallet();

  if (selectedBlockchain === 'Cardano') {
    return <CardanoConnectButton />;
  }

  const {
    connectWallet,
    disconnectWallet,
    selectedProvider,
    setSelectedProvider,
    selectedAccount,
    handleAccountChange,
    accounts,
    PROVIDERS,
    authToken,
    authenticate,
    isConnected
  } = polkadotWallet;

  const handleAuthClick = async () => {
    if (!authToken) {
      try {
        await authenticate();
      } catch (err) {
        console.error('Authentication error:', err);
      }
    }
  };

  return (
    <div className={styles.walletControls}>
      <button 
        className={styles.button} 
        onClick={isConnected ? disconnectWallet : connectWallet}
      >
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>
      {isConnected && (
        <>
          <select 
            className={styles.select} 
            value={selectedProvider} 
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            {PROVIDERS.map((provider, index) => (
              <option key={index} value={provider.url}>{provider.name}</option>
            ))}
          </select>
          <select 
            className={styles.select} 
            value={selectedAccount || ''} 
            onChange={handleAccountChange}
          >
            {accounts.map((account) => (
              <option key={account.meta.name + account.meta.source} value={account.address}>
                {account.meta.name + " " + account.meta.source}
              </option>
            ))}
          </select>
          {authToken ? (
            <span className={styles.authStatus}>Authenticated</span>
          ) : (
            <button className={styles.button} onClick={handleAuthClick}>Authenticate</button>
          )}
        </>
      )}
    </div>
  );
};

export default WalletControls;