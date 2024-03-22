// This could be any page inside the pages directory, for example, pages/about.js
import TxLayout from '../layouts/TxLayout';
import WalletConnector from '../components/WalletConnector';

export default function WalletPage() {
  return (
    <TxLayout>
      <h1>Wallets</h1>
      <p>This is the wallets page, all balances can be viewed here</p>
      <WalletConnector />
    </TxLayout>
  );
}
