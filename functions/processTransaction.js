//  ../functions/processTransaction.js
import updateTransactionTables from '../utils/updateTransactionTables';
import { supabaseAdmin } from '../lib/supabaseClient';

export async function handler(event, context) {
  const contentType = event.headers['content-type'];

  // Check if the content type is JSON
  if (contentType !== 'application/json') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid content type. Expected application/json.' }),
    };
  }

  const { record } = JSON.parse(event.body);

  try {
    await updateTransactionTables(record);
    await supabaseAdmin
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