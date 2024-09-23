// components/Polkadot/PolkadotWalletConnect.tsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import ProjectDetailsForm from '../ProjectDetailsForm';
import styles from '../../styles/PolkadotWalletConnect.module.css';
import { checkWalletExists, getProjectByWallet } from '../../utils/walletReg';
import { usePolkadotData } from '../../context/PolkadotContext';

const PolkadotWalletConnect: React.FC = () => {
  const { polkadotWallet } = useWallet();
  const { 
    selectedAccount,
    balance,
    loading,
    tokens,
    selectedProvider,
    PROVIDERS,
    isConnected,
    authToken
  } = polkadotWallet;

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [hasCheckedWallet, setHasCheckedWallet] = useState(false);
  const [project, setProject] = useState(false);
  const { polkadotData, setPolkadotData } = usePolkadotData();

  useEffect(() => {
    const checkWallet = async () => {
      if (selectedAccount && authToken && !hasCheckedWallet) {
        console.log("Checking wallet existence...");
        try {
          const exists = await checkWalletExists(authToken, selectedAccount, 'Polkadot');
          console.log("Wallet exists:", exists);
          setShowProjectForm(!exists);
          if (exists) {
            const projectDetails = await getProjectByWallet(authToken, selectedAccount, 'Polkadot');
            console.log("Project found:", projectDetails);
            setProject(projectDetails.name);
            setPolkadotData((prevTxData) => ({
              ...prevTxData,
              group: projectDetails.groups.name,
              project: projectDetails.name,
              project_id: projectDetails.id,
            }));
          }
        } catch (error) {
          console.error("Error checking wallet:", error);
        } finally {
          setHasCheckedWallet(true);
        }
      }
    };

    checkWallet();
  }, [selectedAccount, authToken, hasCheckedWallet]);

  useEffect(() => {
    // Reset hasCheckedWallet when the account or provider changes
    if (selectedAccount || selectedProvider) {
      setHasCheckedWallet(false);
    }
  }, [selectedAccount, selectedProvider]);

  console.log("Render - isConnected:", isConnected, "selectedAccount:", selectedAccount, "authToken:", authToken, "showProjectForm:", showProjectForm);

  if (!isConnected || !selectedAccount) {
    return null; // Don't render anything if not connected or no account selected
  }

  return (
    <div className={styles.container}>
      {showProjectForm && authToken && (
        <ProjectDetailsForm 
          walletAddress={selectedAccount} 
          blockchain="Polkadot" 
          provider={selectedProvider}
          token={authToken}
        />
      )}
      <p className={styles.balance}>
        {project} - 
        Balance: {loading ? 'Loading...' : `${balance} ${
          (tokens.find((token: any) => token.name === PROVIDERS.find((provider) => provider.url === selectedProvider)?.name) as any)?.symbol || ''
        }`}
      </p>
    </div>
  );
};

export default PolkadotWalletConnect;