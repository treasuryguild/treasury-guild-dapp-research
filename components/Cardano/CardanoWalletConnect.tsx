// components/Cardano/CardanoWalletConnect.tsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '@meshsdk/react';
import ProjectDetailsForm from '../ProjectDetailsForm';

const CardanoWalletConnect: React.FC = () => {
  const { connected, wallet } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  useEffect(() => {
    if (connected) {
      assignWalletAddress();
    }
  }, [connected]);

  async function assignWalletAddress() {
    const usedAddresses = await wallet.getUsedAddresses();
    setWalletAddress(usedAddresses[0]);
  }
  
  return (
    <div>
      {connected && (
        <ProjectDetailsForm walletAddress={walletAddress} blockchain="Cardano" />
      )}
    </div>
  );
};

export default CardanoWalletConnect;