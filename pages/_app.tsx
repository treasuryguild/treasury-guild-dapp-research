import "../styles/globals.css";
import type { AppProps } from "next/app";
import Nav from '../components/nav';
import { TxDataProvider } from '../context/TxDataContext';
import RootLayout from '../layouts/RootLayout'; // Ensure you adjust this import path to where your RootLayout is located

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout 
      title="Treasury Guild Dapp" 
      description="Multichain Treasury Dapp">
      <TxDataProvider>
        <div className="main">
          <div className="nav">
            <Nav />
            <div className="walletbutton">
            </div>
          </div>
          <div className="component">
            <Component {...pageProps} />
          </div>
        </div>
      </TxDataProvider>
    </RootLayout>
  );
}

export default MyApp;
