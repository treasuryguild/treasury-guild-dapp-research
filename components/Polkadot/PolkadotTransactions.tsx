// components/Polkadot/PolkadotTransactions.tsx
import React, { useState, useEffect } from 'react';
import { useTxData } from '../../context/TxDataContext';
import { PROVIDERS } from '../../constants/providers';
import { fetchAllTransactions, Transaction } from '../../utils/fetchTransactions';
import TransactionTable from '../TransactionTable';

export default function PolkadotTransactions() {
  const { txData, setTxData } = useTxData();
  const [walletBalance, setWalletBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const storedAccount = localStorage.getItem('selectedAccount');
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].url);

  useEffect(() => {
    if (storedAccount) {
      loadTransactions(storedAccount);
    }
  }, [storedAccount]);

  const loadTransactions = async (address: string) => {
    setLoading(true);
    try {
      const data = await fetchAllTransactions(address);
      setTransactions(data);
      console.log('Transactions:', data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setErrorMessage('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Polkadot Transactions</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <TransactionTable transactions={transactions} />
      )}
    </div>
  );
}