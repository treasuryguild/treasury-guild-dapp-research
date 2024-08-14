import "../styles/globals.css";
import type { AppProps } from "next/app";
import { WalletProvider } from '../context/WalletContext';
import { PolkadotDataProvider } from '../context/PolkadotContext';
import { CardanoDataProvider } from '../context/CardanoContext';
import RootLayout from '../layouts/RootLayout';
import { MeshProvider } from "@meshsdk/react";
import Nav from '../components/nav';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MeshProvider>
    <PolkadotDataProvider>
    <CardanoDataProvider>
      <RootLayout 
        title="Treasury Guild Dapp" 
        description="Multichain Treasury Dapp">  
          <WalletProvider>  
            <Nav />
            <Component {...pageProps} />
          </WalletProvider> 
      </RootLayout>
    </CardanoDataProvider>
    </PolkadotDataProvider>
    </MeshProvider>
  );
}

export default MyApp;