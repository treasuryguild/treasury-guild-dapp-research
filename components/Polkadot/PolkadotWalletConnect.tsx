// components/Polkadot/PolkadotWalletConnect.tsx
import React, { useEffect } from 'react';
import { usePolkadotWallet } from '../../hooks/usePolkadotWallet';
import ProjectDetailsForm from '../ProjectDetailsForm';
import styles from '../../styles/PolkadotWalletConnect.module.css';

const PolkadotWalletConnect: React.FC<{ 
  onBalanceLoaded: (loaded: boolean) => void,
  isConnected: boolean,
  onConnectionChange: (connected: boolean) => void
}> = ({ onBalanceLoaded, isConnected, onConnectionChange }) => {
  const { 
    selectedAccount,
    balance,
    loading,
    tokens,
    selectedProvider,
    PROVIDERS
  } = usePolkadotWallet(isConnected, onConnectionChange);

  useEffect(() => {
    console.log('PolkadotWalletConnect: Balance updated', balance); // Debug log
    onBalanceLoaded(!loading && balance !== '');
  }, [loading, balance, onBalanceLoaded]);

  console.log('PolkadotWalletConnect: Rendering', { isConnected, selectedAccount, balance, loading }); // Debug log

  return (
    <div className={styles.container}>
      {isConnected && selectedAccount && (
        <>
          <ProjectDetailsForm walletAddress={selectedAccount} blockchain="Polkadot" />
          <p className={styles.balance}>
            Balance: {loading ? 'Loading...' : `${balance} ${
              (tokens.find((token: any) => token.name === PROVIDERS.find((provider) => provider.url === selectedProvider)?.name) as any)?.symbol || ''
            }`}
          </p>
        </>
      )}
    </div>
  );
};

export default PolkadotWalletConnect;