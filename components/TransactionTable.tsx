// components/TransactionTable.tsx
import React from 'react';
import { Transaction } from '../utils/fetchTransactions';

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
          <th className="py-3 px-6 text-left">Direction</th>
          <th className="py-3 px-6 text-left">Hash</th>
          <th className="py-3 px-6 text-left">Block Number</th>
          <th className="py-3 px-6 text-left">From</th>
          <th className="py-3 px-6 text-left">To</th>
          <th className="py-3 px-6 text-left">Success</th>
          <th className="py-3 px-6 text-left">Fee</th>
          <th className="py-3 px-6 text-left">Type</th>
          <th className="py-3 px-6 text-left">Date</th>
        </tr>
      </thead>
      <tbody className="text-gray-600 text-sm font-light">
        {transactions.map((tx) => (
          <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-100">
            <td className="py-3 px-6 text-left">
              {tx.direction === 'incoming' ? '↓' : '↑'}
            </td>
            <td className="py-3 px-6 text-left whitespace-nowrap">
              {tx.hash.substring(0, 10)}...
            </td>
            <td className="py-3 px-6 text-left">{tx.block_number}</td>
            <td className="py-3 px-6 text-left">
              {tx.from_address.substring(0, 10)}...
            </td>
            <td className="py-3 px-6 text-left">
              {tx.to_address.substring(0, 10)}...
            </td>
            <td className="py-3 px-6 text-left">
              {tx.success ? 'Yes' : 'No'}
            </td>
            <td className="py-3 px-6 text-left">{tx.fee}</td>
            <td className="py-3 px-6 text-left">{tx.tx_type}</td>
            <td className="py-3 px-6 text-left">
              {new Date(tx.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}