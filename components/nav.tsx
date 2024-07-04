import Link from 'next/link';
import React from "react";
import styles from '../styles/Nav.module.css';
import BlockchainSelector from './BlockchainSelector';

const Nav = ({ selectedBlockchain, onBlockchainChange }: any) => {
  return (
    <nav className={styles.routes}>
      <Link href="/" className={styles.navitems}>
        Home
      </Link>
      <Link href='/txbuilder' className={styles.navitems}>
        Build Transaction
      </Link>
      <Link href='/dashboard' className={styles.navitems}>
        Dashboard
      </Link>
      <BlockchainSelector
        selectedBlockchain={selectedBlockchain}
        onBlockchainChange={onBlockchainChange}
      />
    </nav>
  );
};

export default Nav;