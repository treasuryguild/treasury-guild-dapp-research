import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePolkadotWallet } from '../hooks/usePolkadotWallet';
import { useWallet as useMeshWallet } from '@meshsdk/react';

interface WalletContextType {
  selectedBlockchain: string;
  setSelectedBlockchain: (blockchain: string) => void;
  polkadotWallet: ReturnType<typeof usePolkadotWallet>;
  cardanoWallet: ReturnType<typeof useMeshWallet>;
  isCardanoConnected: boolean;
  setIsCardanoConnected: (connected: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>('Polkadot');
  const [isPolkadotConnected, setIsPolkadotConnected] = useState<boolean>(false);
  const [isCardanoConnected, setIsCardanoConnected] = useState<boolean>(false);

  const cardanoWallet = useMeshWallet();
  const polkadotWallet = usePolkadotWallet(isPolkadotConnected, setIsPolkadotConnected);

  useEffect(() => {
    const storedBlockchain = localStorage.getItem('selectedBlockchain');
    if (storedBlockchain) {
      setSelectedBlockchain(storedBlockchain);
    }
    const storedPolkadotConnection = localStorage.getItem('polkadotWalletConnected');
    setIsPolkadotConnected(storedPolkadotConnection === 'true');
    const storedCardanoConnection = localStorage.getItem('cardanoWalletConnected');
    setIsCardanoConnected(storedCardanoConnection === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedBlockchain', selectedBlockchain);
  }, [selectedBlockchain]);

  return (
    <WalletContext.Provider value={{
      selectedBlockchain,
      setSelectedBlockchain,
      polkadotWallet,
      cardanoWallet,
      isCardanoConnected,
      setIsCardanoConnected
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};