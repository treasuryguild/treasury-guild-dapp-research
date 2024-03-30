// components/PolkadotWalletConnect.tsx
import React, { useState, useEffect } from 'react';
import { useTxData } from '../../context/TxDataContext';
import ProjectDetailsForm from '../../components/ProjectDetailsForm';

const CardanoWalletConnect: React.FC = () => {
  const { txData, setTxData } = useTxData();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null); // State to hold the selected account
  const [status, setStatus] = useState<string>('Not connected');
  

  return (
    <div>
        Cardano Wallet
    </div>
  );
};

export default CardanoWalletConnect;
