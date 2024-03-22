// components/WalletConnector.tsx
import React from 'react';
import PolkadotWalletConnect from '../components/PolkadotWalletConnect';
import PolkaWalletConnect from './PolkaWalletConnect';
// Import other wallet components here

const WalletConnector: React.FC = () => {
  return (
    <div>
      <h2>Connect Your Wallet</h2>
      <PolkadotWalletConnect />
      {/* Render other wallet connect components here */}
    </div>
  );
};

export default WalletConnector;
