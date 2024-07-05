// components/Nav.tsx
import Link from 'next/link';
import React from "react";
import styles from '../styles/Nav.module.css';
import BlockchainSelector from './BlockchainSelector';
import PolkadotWalletControls from './Polkadot/PolkadotWalletControls';
import CardanoConnectButton from './Cardano/CardanoConnectButton';

const Nav = ({ selectedBlockchain, onBlockchainChange, polkadotWalletConnected, onPolkadotWalletConnection }: any) => {
  return (
    <nav className={styles.routes}>
      <Link href="/" className={styles.navitems}>
        Home
      </Link>
      <Link href='/txbuilder' className={styles.navitems}>
        Build Tx
      </Link>
      <Link href='/dashboard' className={styles.navitems}>
        Dashboard
      </Link>
      <div className={styles.walletControls}>
        {selectedBlockchain === 'Polkadot' ? (
          <PolkadotWalletControls 
            isConnected={polkadotWalletConnected}
            onConnectionChange={onPolkadotWalletConnection}
          />
        ) : (
          <CardanoConnectButton />
        )}
      </div>
      <BlockchainSelector
        selectedBlockchain={selectedBlockchain}
        onBlockchainChange={onBlockchainChange}
      />
    </nav>
  );
};

export default Nav;