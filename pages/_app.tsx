import "../styles/globals.css";
import type { AppProps } from "next/app";
import { WalletProvider } from '../context/WalletContext';
import { TxDataProvider } from '../context/TxDataContext';
import RootLayout from '../layouts/RootLayout';
import { MeshProvider } from "@meshsdk/react";
import Nav from '../components/nav';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MeshProvider>
      <RootLayout 
        title="Treasury Guild Dapp" 
        description="Multichain Treasury Dapp">
        <TxDataProvider>
          <WalletProvider>  
            <Nav />
            <Component {...pageProps} />
          </WalletProvider>
        </TxDataProvider>
      </RootLayout>
    </MeshProvider>
  );
}

export default MyApp;