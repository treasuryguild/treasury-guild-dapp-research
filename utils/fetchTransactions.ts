// utils/fetchTransactions.ts
import { supabaseAnon } from '../lib/supabaseClient';

export interface Transaction {
  id: string;
  hash: string;
  block_number: number | null;
  from_address: string;
  to_address: string;
  success: boolean;
  fee: string;
  tx_type: string;
  created_at: string;
  direction: 'incoming' | 'outgoing';
}

export async function fetchAllTransactions(address: string): Promise<Transaction[]> {
  try {
    // Fetch outgoing transactions
    const { data: outgoingData, error: outgoingError } = await supabaseAnon
      .from('transactions')
      .select('*')
      .eq('from_address', address);

    if (outgoingError) {
      console.error('Error fetching outgoing transactions:', outgoingError);
      throw new Error(`Outgoing transactions error: ${outgoingError.message}`);
    }

    // Fetch incoming transactions
    const { data: incomingData, error: incomingError } = await supabaseAnon
      .from('transaction_outputs')
      .select(`
        transactions:transaction_id (
          id,
          hash,
          block_number,
          from_address,
          success,
          fee,
          tx_type,
          data,
          created_at
        )
      `)
      .eq('to_address', address);

    if (incomingError) {
      console.error('Error fetching incoming transactions:', incomingError);
      throw new Error(`Incoming transactions error: ${incomingError.message}`);
    }

    // Process outgoing transactions
    const outgoingTransactions: Transaction[] = (outgoingData || []).map(tx => ({
      ...tx,
      direction: 'outgoing' as const
    }));

    // Process incoming transactions
    const incomingTransactions: Transaction[] = (incomingData || []).map((item: any) => ({
      ...item.transactions,
      to_address: address,
      direction: 'incoming' as const
    }));

    // Combine all transactions
    const allTransactions = [...outgoingTransactions, ...incomingTransactions];

    // Custom sorting function
    const sortTransactions = (a: Transaction, b: Transaction) => {
      // If both have block numbers, compare them
      if (a.block_number !== null && b.block_number !== null) {
        return b.block_number - a.block_number;
      }
      
      // If only one has a block number, prioritize it
      if (a.block_number !== null) return -1;
      if (b.block_number !== null) return 1;
      
      // If neither has a block number, compare created_at dates
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    };

    // Sort the transactions
    allTransactions.sort(sortTransactions);

    return allTransactions;
  } catch (error) {
    console.error('Error in fetchAllTransactions:', error);
    throw error;
  }
}