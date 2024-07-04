import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import WalletDashboard from '../../components/WalletDashboard';
import PublicProjectsDashboard from '../../components/PublicProjectsDashboard';
import styles from '../../styles/Dashboard.module.css';
import { useTxData } from '../../context/TxDataContext';

export default function Dashboard({ selectedBlockchain }: { selectedBlockchain: string }) {
  const [view, setView] = React.useState<'public' | 'wallet'>('wallet');
  const { txData } = useTxData();

  console.log('txData:', txData);

  return (
    <DashboardLayout blockchain={view === 'wallet' ? selectedBlockchain : undefined}>
      <div className={styles.container}>
        <div className={styles.buttonContainer}>
          <button 
            className={`${styles.button} ${view === 'wallet' ? styles.active : ''}`} 
            onClick={() => setView('wallet')}
          >
            Connected Wallets
          </button>
          <button 
            className={`${styles.button} ${view === 'public' ? styles.active : ''}`} 
            onClick={() => setView('public')}
          >
            Public Projects
          </button>
        </div>
        <div className={styles.content}>
          {view === 'public' ? (
            <PublicProjectsDashboard />
          ) : (
            <WalletDashboard blockchain={selectedBlockchain} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}