// components/Nav.tsx
import Link from 'next/link';
import React from "react";
import styles from '../styles/Nav.module.css';
import BlockchainSelector from './BlockchainSelector';
import WalletControls from './WalletControls';
import { useWallet } from '../context/WalletContext';

const Nav = () => {
  const { selectedBlockchain, setSelectedBlockchain } = useWallet();

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
      <WalletControls />
      <BlockchainSelector
        selectedBlockchain={selectedBlockchain}
        onBlockchainChange={setSelectedBlockchain}
      />
    </nav>
  );
};

export default Nav;