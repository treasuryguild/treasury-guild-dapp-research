// This could be any page inside the pages directory, for example, pages/about.js
import WalletsLayout from '../layouts/WalletsLayout';
import { useState } from 'react';
import styles from '../styles/Wallets.module.css';
import PolkadotWalletConnect from '../components/Polkadot/PolkadotWalletConnect';
import CardanoWalletConnect from '../components/Cardano/CardanoWalletConnect';

export default function WalletPage() {
  const [blockchain, setBlockchain] = useState('Polkadot');
  const [balanceLoaded, setBalanceLoaded] = useState(false);

  return (
    <WalletsLayout blockchain={blockchain}>
      <div className={styles.container}>
        <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={() => setBlockchain('Polkadot')}>Polkadot</button>
            <button className={styles.button} onClick={() => setBlockchain('Cardano')}>Cardano</button>
        </div>
        <div className={styles.content}>
          {blockchain === 'Polkadot' ? (
            <>
              <PolkadotWalletConnect onBalanceLoaded={setBalanceLoaded} />
              {balanceLoaded && (
                <p>Polkadot</p>
              )}
            </>
          ) : (
            <>
              <CardanoWalletConnect />
              Cardano
            </>
          )}
        </div>
        <p>This is the wallets page, all balances can be viewed here</p>
      </div>
    </WalletsLayout>
  );
}
