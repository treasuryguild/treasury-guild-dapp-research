// .netlify/functions/processTransaction.js
import { createClient } from '@supabase/supabase-js';
import updateTransactionTables from './updateTransactionTables';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event, context) {
  const { record } = JSON.parse(event.body);

  try {
    await updateTransactionTables(record);
    await supabase
      .from('pending_transactions')
      .update({ processed: true })
      .eq('id', record.id);
    console.log('Transaction processed successfully:', record.id);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Transaction processed successfully' }),
    };
  } catch (error) {
    console.error('Error processing transaction:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error processing transaction' }),
    };
  }
}