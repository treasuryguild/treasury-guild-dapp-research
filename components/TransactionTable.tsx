// components/TransactionTable.tsx
import React, { useMemo } from 'react';
import { Transaction } from '../utils/fetchTransactions';
import styles from '../styles/TransactionsTable.module.css';

interface TransactionTableProps {
  transactions: Transaction[];
}

interface TokenAmount {
  [tokenSymbol: string]: string;
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const { tokenColumns, processedTransactions } = useMemo(() => {
    const tokenSet = new Set<string>();
    const processedTxs = transactions.map(tx => {
      const tokenAmounts: TokenAmount = {};
      
      tx.data.contributions.forEach(contribution => {
        contribution.outputs.forEach(output => {
          output.tokens.forEach(token => {
            const symbol = token.token.symbol;
            tokenSet.add(symbol);
            const amount = Number(token.amount);
            tokenAmounts[symbol] = (parseFloat(tokenAmounts[symbol] || '0') + amount).toString();
          });
        });
      });
      
      return {
        ...tx,
        tokenAmounts
      };
    });

    return {
      tokenColumns: Array.from(tokenSet),
      processedTransactions: processedTxs
    };
  }, [transactions]);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Block Number</th>
            <th>From</th>
            <th>To</th>
            {tokenColumns.map(token => (
              <th key={token}>{token}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {processedTransactions.map((tx) => (
            <tr key={tx.id}>
              <td>{new Date(tx.created_at).toLocaleDateString()}</td>
              <td>
                <span className={tx.direction === 'incoming' ? styles.incomingArrow : styles.outgoingArrow}>
                  {tx.direction === 'incoming' ? '↓' : '↑'}
                </span>
              </td>
              <td>{tx.block_number}</td>
              <td>{tx.from_address.substring(0, 10)}...</td>
              <td>{tx.to_address.substring(0, 10)}...</td>
              {tokenColumns.map(token => (
                <td key={token}>
                  {tx.tokenAmounts[token] ? parseFloat(tx.tokenAmounts[token]).toFixed(2) : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}