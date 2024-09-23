// ../components/Cardano/CardanoCustomConnectButton.tsx
import React, { useState, useEffect } from 'react';
import { createSupabaseAuthClient } from '../../lib/supabaseClient';
import { BrowserWallet } from '@meshsdk/core';
import { useCardanoData } from '../../context/CardanoContext';
import { useWallet } from '../../context/WalletContext';
import styles from '../../styles/WalletControls.module.css';

const CardanoCustomConnectButton: React.FC = () => {
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [wallet, setWallet] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { cardanoData, setCardanoData } = useCardanoData();
  const { isCardanoConnected, setIsCardanoConnected, selectedBlockchain } = useWallet();
  const { setSupabaseAuthClient } = useWallet();

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
        await updateWalletInfo(connectedWallet, selectedWallet);
      }
    };
    reconnectWallet();
  }, [isCardanoConnected, selectedWallet]);

  useEffect(() => {
    const refreshWalletInfo = async () => {
      if (selectedBlockchain === 'Cardano' && isCardanoConnected && wallet) {
        await updateWalletInfo(wallet, selectedWallet);
      }
    };
    refreshWalletInfo();
  }, [selectedBlockchain, isCardanoConnected, wallet]);

  const connectWallet = async () => {
    if (selectedWallet) {
      const connectedWallet = await BrowserWallet.enable(selectedWallet);
      setWallet(connectedWallet);
      await updateWalletInfo(connectedWallet, selectedWallet);
      await startLoginProcess(connectedWallet);
      setIsCardanoConnected(true);
    }
  };

  const updateWalletInfo = async (connectedWallet: any, selectedWallet: string) => {
    const rewardAddresses = await connectedWallet.getRewardAddresses();
    const walletAddress = await connectedWallet.getUsedAddresses();
    const balance = await connectedWallet.getBalance();
    setCardanoData((prevTxData) => ({
      ...prevTxData,
      wallet: walletAddress[0],
      ada_wallet_stake_address: rewardAddresses[0],
      balance: balance,
      provider: selectedWallet,
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
      setCardanoData(prevTxData => ({
        ...prevTxData,
        authToken: token
      }));
      
      const supabase = createSupabaseAuthClient(token);
      setSupabaseAuthClient(supabase);
    } else {
      console.error('Authentication failed', await response.text());
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setIsCardanoConnected(false);
    setSelectedWallet('');
    setCardanoData((prevTxData) => ({
      ...prevTxData,
      wallet: '',
      ada_wallet_stake_address: '',
      balance: '',
      provider: '',
      authToken: '',
    }));

  };

  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWallet(e.target.value);
    if (isCardanoConnected) {
      disconnectWallet();
    }
  };
  
  return (
    <div className={styles.walletControls}>
      {isCardanoConnected ? (
        <>
          <p>{selectedWallet}</p>
          {cardanoData.authToken ? (
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