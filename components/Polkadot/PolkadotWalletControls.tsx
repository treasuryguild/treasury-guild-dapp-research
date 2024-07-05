// components/Polkadot/PolkadotWalletControls.tsx
import React from 'react';
import { usePolkadotWallet } from '../../hooks/usePolkadotWallet';
import styles from '../../styles/PolkadotWalletConnect.module.css';

const PolkadotWalletControls: React.FC<{
  isConnected: boolean,
  onConnectionChange: (connected: boolean) => void
}> = ({ isConnected, onConnectionChange }) => {
  const {
    connectWallet,
    disconnectWallet,
    selectedProvider,
    setSelectedProvider,
    selectedAccount,
    handleAccountChange,
    accounts,
    PROVIDERS
  } = usePolkadotWallet(isConnected, onConnectionChange);

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
        </>
      )}
    </div>
  );
};

export default PolkadotWalletControls;