// components/WalletConnector.tsx
import React from 'react';
import PolkadotWalletConnect from './Polkadot/PolkadotWalletConnect';
import PolkaWalletConnect from './Polkadot/PolkaWalletConnect';
// Import other wallet components here

const WalletConnector: React.FC = () => {
  return (
    <div>
      <PolkadotWalletConnect />
      {/* Render other wallet connect components here */}
    </div>
  );
};

export default WalletConnector;
