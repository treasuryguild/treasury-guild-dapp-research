// Assuming this file is saved as layouts/ExamplePageLayout.js
import RootLayout from './RootLayout';
import styles from '../styles/Layouts.module.css';

export default function WalletsLayout({ children, blockchain }: Readonly<{children: React.ReactNode; blockchain: string;}>) {
  return (
    <RootLayout title="TxBuilder" description="Building transaction">
      <header className={styles.header}>
        <h1 className={styles.title}>Wallets - {blockchain}</h1>
      </header>
      <main>{children}</main>
      <footer>
        Footer
      </footer>
    </RootLayout>
  );
}