import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from 'react';
import Nav from '../components/nav';
import { TxDataProvider } from '../context/TxDataContext';
import RootLayout from '../layouts/RootLayout';
import { MeshProvider } from "@meshsdk/react";

function MyApp({ Component, pageProps }: AppProps) {
  const [selectedBlockchain, setSelectedBlockchain] = useState('Polkadot');

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
              />
            </div>
            <div className="component">
              <Component {...pageProps} selectedBlockchain={selectedBlockchain} />
            </div>
          </div>
        </TxDataProvider>
      </MeshProvider>
    </RootLayout>
  );
}

export default MyApp;