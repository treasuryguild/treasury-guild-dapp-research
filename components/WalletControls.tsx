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
    isConnected,
    isAuthenticating
  } = polkadotWallet;

  return (
    <div className={styles.walletControls}>
      {isConnected && (
        <>
          <select 
            className={styles.select}
            value={selectedProvider} 
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            {PROVIDERS.map((provider, index) => (
              <option key={index} value={provider.url}>
                {provider.name}
              </option>
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
            <span className={`${styles.authStatus} ${styles.authenticated}`}>✓</span>
          ) : isAuthenticating ? (
            <span className={`${styles.authStatus} ${styles.authenticating}`}>Auth...</span>
          ) : (
            <span className={`${styles.authStatus} ${styles.notAuthenticated}`}>Not Auth</span>
          )}
        </>
      )}
      <button 
        className={styles.button}
        onClick={isConnected ? disconnectWallet : connectWallet}
      >
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
};

export default WalletControls;