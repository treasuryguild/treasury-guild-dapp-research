import React from 'react';
import RootLayout from './RootLayout';
import styles from '../styles/Layouts.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  blockchain?: string;
}

export default function TxLayout({ children, blockchain }: DashboardLayoutProps) {
  return (
    <RootLayout title="Dashboard" description="View project dashboard">
      <header className={styles.header}>
        <h1 className={styles.title}>
          Dashboard{blockchain ? ` - ${blockchain}` : ''}
        </h1>
      </header>
      <main>{children}</main>
      <footer>
        Footer
      </footer>
    </RootLayout>
  );
}