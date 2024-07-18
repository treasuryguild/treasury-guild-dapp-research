// components/Polkadot/PolkadotWalletControls.tsx
import React, { useEffect, useState } from 'react';
import { usePolkadotWallet } from '../../hooks/usePolkadotWallet';
import styles from '../../styles/PolkadotWalletConnect.module.css';

const PolkadotWalletControls: React.FC<{
  isConnected: boolean,
  onConnectionChange: (connected: boolean) => void
}> = ({ isConnected, onConnectionChange }) => {
  const [error, setError] = useState<string | null>(null);
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
    balance,
    loading
  } = usePolkadotWallet(isConnected, onConnectionChange);

  useEffect(() => {
    if (isConnected && !authToken) {
      handleAuthentication();
    }
  }, [isConnected, authToken]);

  const handleAuthentication = async () => {
    try {
      setError(null);
      await authenticate();
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication failed. Please try again.');
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
            className={styles.accountSelect} 
            value={selectedProvider} 
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            {PROVIDERS.map((provider, index) => (
              <option key={index} value={provider.url}>{provider.name}</option>
            ))}
          </select>
          <select 
            className={styles.accountSelect} 
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
            <button className={styles.button} onClick={handleAuthentication}>Authenticate</button>
          )}
          {error && <p className={styles.error}>{error}</p>}
        </>
      )}
    </div>
  );
};

export default PolkadotWalletControls;