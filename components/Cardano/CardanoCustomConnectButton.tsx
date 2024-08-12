import React, { useState, useEffect } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import { useTxData } from '../../context/TxDataContext';
import styles from '../../styles/WalletControls.module.css';

const CardanoCustomConnectButton: React.FC = () => {
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { txData, setTxData } = useTxData();

  useEffect(() => {
    const getWallets = async () => {
      const wallets = await BrowserWallet.getInstalledWallets();
      setAvailableWallets(wallets);
    };
    getWallets();
  }, []);

  const connectWallet = async () => {
    if (selectedWallet) {
      const connectedWallet = await BrowserWallet.enable(selectedWallet);
      setWallet(connectedWallet);
      setIsConnected(true);

      // Update txData with Cardano wallet information
      const rewardAddresses = await connectedWallet.getRewardAddresses();
      const balance = await connectedWallet.getBalance();
      setTxData((prevTxData) => ({
        ...prevTxData,
        wallet: rewardAddresses[0], // Using the reward address as the wallet address
        balance: balance,
        provider: 'Cardano',
      }));

      // Start the authentication process
      await startLoginProcess(connectedWallet, rewardAddresses[0]);
    }
  };

  const startLoginProcess = async (connectedWallet: any, userAddress: string) => {
    setIsAuthenticating(true);
    try {
      const nonce = await backendGetNonce(userAddress);
      console.log('Nonce received:', nonce, 'wallet:', connectedWallet, 'wallet address:', userAddress);
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
    setIsConnected(false);
    setSelectedWallet(null);

    // Clear Cardano-specific data from txData
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
    if (isConnected) {
      disconnectWallet();
    }
  };

  console.log("txData", txData);

  return (
    <div className={styles.walletControls}>
      {isConnected ? (
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