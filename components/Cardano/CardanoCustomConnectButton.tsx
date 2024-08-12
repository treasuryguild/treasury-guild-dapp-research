// ../components/Cardano/CardanoCustomConnectButton.tsx
import React, { useState, useEffect } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import { useTxData } from '../../context/TxDataContext';
import { useWallet } from '../../context/WalletContext';
import styles from '../../styles/WalletControls.module.css';

const CardanoCustomConnectButton: React.FC = () => {
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { txData, setTxData } = useTxData();
  const { isCardanoConnected, setIsCardanoConnected, selectedBlockchain } = useWallet();

  useEffect(() => {
    const getWallets = async () => {
      const wallets = await BrowserWallet.getInstalledWallets();
      setAvailableWallets(wallets);
    };
    getWallets();
  }, []);

  useEffect(() => {
    const reconnectWallet = async () => {
      if (isCardanoConnected && selectedWallet) {
        const connectedWallet = await BrowserWallet.enable(selectedWallet);
        setWallet(connectedWallet);
        await updateWalletInfo(connectedWallet);
      }
    };
    reconnectWallet();
  }, [isCardanoConnected, selectedWallet]);

  useEffect(() => {
    const refreshWalletInfo = async () => {
      if (selectedBlockchain === 'Cardano' && isCardanoConnected && wallet) {
        await updateWalletInfo(wallet);
      }
    };
    refreshWalletInfo();
  }, [selectedBlockchain, isCardanoConnected, wallet]);

  const connectWallet = async () => {
    if (selectedWallet) {
      const connectedWallet = await BrowserWallet.enable(selectedWallet);
      setWallet(connectedWallet);
      setIsCardanoConnected(true);
      localStorage.setItem('cardanoWalletConnected', 'true');
      localStorage.setItem('cardanoSelectedWallet', selectedWallet);

      await updateWalletInfo(connectedWallet);
      await startLoginProcess(connectedWallet);
    }
  };

  const updateWalletInfo = async (connectedWallet: any) => {
    const rewardAddresses = await connectedWallet.getRewardAddresses();
    const balance = await connectedWallet.getBalance();
    setTxData((prevTxData) => ({
      ...prevTxData,
      wallet: rewardAddresses[0],
      balance: balance,
      provider: 'Cardano',
    }));
  };

  const startLoginProcess = async (connectedWallet: any) => {
    setIsAuthenticating(true);
    try {
      const rewardAddresses = await connectedWallet.getRewardAddresses();
      const userAddress = rewardAddresses[0];
      const nonce = await backendGetNonce(userAddress);
      await signMessage(connectedWallet, userAddress, nonce);
    } catch (error) {
      console.error('Error during login process:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const backendGetNonce = async (userAddress: string) => {
    const response = await fetch('/api/auth/cardano/nonce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress })
    });
    if (response.ok) {
      const { nonce } = await response.json();
      return nonce;
    } else {
      throw new Error('Failed to get nonce');
    }
  };

  const signMessage = async (connectedWallet: any, userAddress: string, nonce: string) => {
    try {
      const signature = await connectedWallet.signData(userAddress, nonce);
      await verifySignature(userAddress, signature);
    } catch (error) {
      console.error('Error signing message:', error);
    }
  };

  const verifySignature = async (userAddress: string, signature: string) => {
    const response = await fetch('/api/auth/cardano/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress, signature })
    });
    if (response.ok) {
      const { token } = await response.json();
      console.log('Authentication successful, token received');
      setTxData(prevTxData => ({
        ...prevTxData,
        authToken: token
      }));
      localStorage.setItem('cardanoAuthToken', token);
    } else {
      console.error('Authentication failed', await response.text());
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setIsCardanoConnected(false);
    setSelectedWallet(null);
    localStorage.removeItem('cardanoWalletConnected');
    localStorage.removeItem('cardanoSelectedWallet');

    setTxData((prevTxData) => ({
      ...prevTxData,
      wallet: '',
      balance: '',
      provider: '',
      authToken: null,
    }));

    localStorage.removeItem('cardanoAuthToken');
  };

  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWallet(e.target.value);
    if (isCardanoConnected) {
      disconnectWallet();
    }
  };

  useEffect(() => {
    const storedWallet = localStorage.getItem('cardanoSelectedWallet');
    if (storedWallet) {
      setSelectedWallet(storedWallet);
    }
  }, []);
  
  return (
    <div className={styles.walletControls}>
      {isCardanoConnected ? (
        <>
          <p>{selectedWallet}</p>
          {txData.authToken ? (
            <span className={`${styles.authStatus} ${styles.authenticated}`}>✓</span>
          ) : isAuthenticating ? (
            <span className={`${styles.authStatus} ${styles.authenticating}`}>Auth...</span>
          ) : (
            <span className={`${styles.authStatus} ${styles.notAuthenticated}`}>Not Auth</span>
          )}
          <button 
            className={styles.button}
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </>
      ) : (
        <>
          <select 
            className={styles.select}
            value={selectedWallet || ''} 
            onChange={handleWalletChange}
          >
            <option value="">Select a wallet</option>
            {availableWallets.map((wallet) => (
              <option key={wallet.name} value={wallet.name}>
                {wallet.name}
              </option>
            ))}
          </select>
          <button 
            className={styles.button}
            onClick={connectWallet}
            disabled={!selectedWallet}
          >
            Connect
          </button>
        </>
      )}
    </div>
  );
};

export default CardanoCustomConnectButton;