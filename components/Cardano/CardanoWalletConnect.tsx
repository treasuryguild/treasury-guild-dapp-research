// components/PolkadotWalletConnect.tsx
import React, { useState, useEffect } from 'react';
import { useTxData } from '../../context/TxDataContext';
import ProjectDetailsForm from '../../components/ProjectDetailsForm';
import { useWallet } from '@meshsdk/react';
import { CardanoWallet } from '@meshsdk/react';

const CardanoWalletConnect: React.FC = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { txData, setTxData } = useTxData();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null); // State to hold the selected account
  const [status, setStatus] = useState<string>('Not connected');
  const [tokens, setTokens] = useState<[] | any>([{"id":"1","name":"ADA","amount":0.00,"unit":"lovelace","decimals": 6}])
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  async function getAssets() {
    if (wallet) {
      setLoading(true);
      const _assets = await wallet.getAssets();
      setAssets(_assets);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (connected) {
      assignTokens()
    } else {setTokens([{"id":"1","name":"ADA","amount":0.00,"unit":"lovelace","decimals": 6}]);}
  }, [connected]);

  async function assignTokens() {
    const usedAddresses = await wallet.getUsedAddresses();
    setWalletAddress(usedAddresses[0]);
  }
  
  console.log( wallet);
  return (
    <div>
      <CardanoWallet />
      {connected && (
            <ProjectDetailsForm walletAddress={walletAddress} blockchain="Cardano" />
          )}
    </div>
  );
};

export default CardanoWalletConnect;
