// components/Cardano/CardanoWalletConnect.tsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '@meshsdk/react';
import ProjectDetailsForm from '../ProjectDetailsForm';

const CardanoWalletConnect: React.FC = () => {
  const { connected, wallet } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const getWalletAddress = async () => {
      if (connected) {
        setLoading(true);
        setError(null);
        try {
          const usedAddresses = await wallet.getUsedAddresses();
          if (usedAddresses.length > 0) {
            setWalletAddress(usedAddresses[0]);
          } else {
            setError("No used addresses found in the wallet.");
          }
        } catch (err) {
          console.error("Error fetching wallet address:", err);
          setError("Failed to fetch wallet address. Please try reconnecting.");
        } finally {
          setLoading(false);
        }
      } else {
        setWalletAddress(null);
      }
    };

    getWalletAddress();
  }, [connected, wallet]);
  
  if (!connected) {
    return <div>Please connect your Cardano wallet.</div>;
  }

  if (loading) {
    return <div>Loading wallet information...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {walletAddress ? (
        <ProjectDetailsForm walletAddress={walletAddress} blockchain="Cardano" provider='Cardano'/>
      ) : (
        <div>No wallet address available. Please try reconnecting your wallet.</div>
      )}
    </div>
  );
};

export default CardanoWalletConnect;