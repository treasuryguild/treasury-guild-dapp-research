// ../components/BlockchainSelector.tsx
import React from 'react';
import styles from '../styles/Nav.module.css';

const BlockchainSelector = ({ selectedBlockchain, onBlockchainChange, blockchains = ['Polkadot', 'Cardano'] }: any) => {
  return (
    <select
      className={styles.blockchainSelector}
      value={selectedBlockchain}
      onChange={(e) => onBlockchainChange(e.target.value)}
    >
      {blockchains.map((blockchain: string) => (
        <option key={blockchain} value={blockchain}>
          {blockchain}
        </option>
      ))}
    </select>
  );
};

export default BlockchainSelector;