// components/Polkadot/PolkadotWalletConnect.tsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import ProjectDetailsForm from '../ProjectDetailsForm';
import styles from '../../styles/PolkadotWalletConnect.module.css';
import { checkWalletExists } from '../../utils/walletReg';

const PolkadotWalletConnect: React.FC = () => {
  const { polkadotWallet } = useWallet();
  const { 
    selectedAccount,
    balance,
    loading,
    tokens,
    selectedProvider,
    PROVIDERS,
    isConnected
  } = polkadotWallet;

  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    const checkWallet = async () => {
      if (selectedAccount) {
        const exists = await checkWalletExists(selectedAccount, 'Polkadot');
        setShowProjectForm(!exists);
      }
    };

    checkWallet();
  }, [selectedAccount, selectedProvider]);

  if (!isConnected || !selectedAccount) {
    return null; // Don't render anything if not connected or no account selected
  }

  return (
    <div className={styles.container}>
        <ProjectDetailsForm 
          walletAddress={selectedAccount} 
          blockchain="Polkadot" 
          provider={selectedProvider}
        />
      <p className={styles.balance}>
        Balance: {loading ? 'Loading...' : `${balance} ${
          (tokens.find((token: any) => token.name === PROVIDERS.find((provider) => provider.url === selectedProvider)?.name) as any)?.symbol || ''
        }`}
      </p>
    </div>
  );
};

export default PolkadotWalletConnect;