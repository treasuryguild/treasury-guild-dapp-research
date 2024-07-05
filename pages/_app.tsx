// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from 'react';
import Nav from '../components/nav';
import { TxDataProvider } from '../context/TxDataContext';
import RootLayout from '../layouts/RootLayout';
import { MeshProvider } from "@meshsdk/react";

function MyApp({ Component, pageProps }: AppProps) {
  const [selectedBlockchain, setSelectedBlockchain] = useState('Polkadot');
  const [polkadotWalletConnected, setPolkadotWalletConnected] = useState(false);

  useEffect(() => {
    const storedConnection = localStorage.getItem('polkadotWalletConnected');
    setPolkadotWalletConnected(storedConnection === 'true');
  }, []);

  const handlePolkadotWalletConnection = (connected: boolean) => {
    setPolkadotWalletConnected(connected);
    localStorage.setItem('polkadotWalletConnected', connected.toString());
  };

  return (
    <RootLayout 
      title="Treasury Guild Dapp" 
      description="Multichain Treasury Dapp">
      <MeshProvider>
        <TxDataProvider>
          <div className="main">
            <div className="nav">
              <Nav 
                selectedBlockchain={selectedBlockchain}
                onBlockchainChange={setSelectedBlockchain}
                polkadotWalletConnected={polkadotWalletConnected}
                onPolkadotWalletConnection={handlePolkadotWalletConnection}
              />
            </div>
            <div className="component">
              <Component 
                {...pageProps} 
                selectedBlockchain={selectedBlockchain} 
                polkadotWalletConnected={polkadotWalletConnected}
                onPolkadotWalletConnection={handlePolkadotWalletConnection}
              />
            </div>
          </div>
        </TxDataProvider>
      </MeshProvider>
    </RootLayout>
  );
}

export default MyApp;