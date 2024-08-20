// ../functions/processTransaction.js
import { createClient } from '@supabase/supabase-js';
import updateTransactionTables from '../utils/updateTransactionTables';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function handler(event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Event body type:', typeof event.body);
  console.log('Event body:', event.body);

  let jsonData;
  try {
    // Check if the body is already an object
    if (typeof event.body === 'object' && event.body !== null) {
      jsonData = event.body;
    } else if (typeof event.body === 'string') {
      // If it's a string, try to parse it
      jsonData = JSON.parse(event.body);
    } else {
      throw new Error(`Unexpected event.body type: ${typeof event.body}`);
    }
    console.log('Processed JSON data:', JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.error('Error processing JSON:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body', details: error.message })
    };
  }

  try {
    // The service role key is already set when creating the client,
    // so we don't need to set it explicitly for each request

    await updateTransactionTables(jsonData.record.json_data, supabaseAdmin);
    
    const { error } = await supabaseAdmin
      .from('pending_transactions')
      .update({ processed: true })
      .eq('id', jsonData.record.id);

    if (error) throw error;

    console.log('Transaction processed successfully:', jsonData.record.id);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Transaction processed successfully' }),
    };
  } catch (error) {
    console.error('Error processing transaction:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error processing transaction', details: error.message }),
    };
  }
}