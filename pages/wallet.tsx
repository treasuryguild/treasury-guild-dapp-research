// This could be any page inside the pages directory, for example, pages/about.js
import TxLayout from '../layouts/TxLayout';
import WalletConnector from '../components/WalletConnector';
import { useState } from 'react';

export default function WalletPage() {
  const [blockchain, setBlockchain] = useState('Polkadot');

  return (
    <TxLayout blockchain={blockchain}>
      <h1>Wallets</h1>
      <p>This is the wallets page, all balances can be viewed here</p>
      <WalletConnector />
    </TxLayout>
  );
}
