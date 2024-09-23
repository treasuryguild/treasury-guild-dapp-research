// components/Cardano/CardanoWalletConnect.tsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useCardanoData } from '../../context/CardanoContext';
import ProjectDetailsForm from '../ProjectDetailsForm';
//import { checkWalletExists, getProjectByWallet } from '../../utils/walletReg';
import { BrowserWallet } from '@meshsdk/core';

const CardanoWalletConnect: React.FC = () => {
  const { cardanoWallet, isCardanoConnected, selectedBlockchain } = useWallet(); 
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { cardanoData, setCardanoData } = useCardanoData();
  
  useEffect(() => {
    const getWalletAddress = async () => {
      if (isCardanoConnected) {
        setLoading(true);
        setError(null);
        try {
          //console.log("Used addresses:", cardanoData);
          const wallet = await BrowserWallet.enable(cardanoData.provider);
          const walletAddress = await wallet.getUsedAddresses();
          //const projectDetails = await getProjectByWallet(cardanoData.authToken, walletAddress[0], 'Cardano');
          if (true) {
            setWalletAddress(walletAddress[0]);
            //console.log("Wallet address using browser wallet:", walletAddress[0], projectDetails);
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
  }, [isCardanoConnected]);
  
  if (!isCardanoConnected) {
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
        <ProjectDetailsForm walletAddress={walletAddress} blockchain="Cardano" provider='Cardano' token={cardanoData.authToken}/>
      ) : (
        <div>No wallet address available. Please try reconnecting your wallet.</div>
      )}
    </div>
  );
};

export default CardanoWalletConnect;