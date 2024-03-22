
import TxLayout from '../../layouts/TxLayout'; // Adjust the path as necessary
import PolkadotTxBuilder from '../../components/PolkadotTxBuilder';

export default function TxBuilder() {
  return (
    <TxLayout>
      <h1>Transaction Builder</h1>
      <p>Use this page to build and submit transactions to the Polkadot network.</p>
      <PolkadotTxBuilder />
    </TxLayout>
  );
}
