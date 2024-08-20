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
    if (typeof event.body === 'object') {
      jsonData = event.body;
    } else {
      // If it's a string, try to parse it
      jsonData = JSON.parse(event.body);
    }
    console.log('Processed JSON data:', JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.error('Error processing JSON:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' })
    };
  }

  try {
    // Explicitly set the role to bypass RLS
    await supabaseAdmin.auth.setAuth(supabaseServiceRoleKey);

    await updateTransactionTables(jsonData, supabaseAdmin);
    
    const { error } = await supabaseAdmin
      .from('pending_transactions')
      .update({ processed: true })
      .eq('id', record.id);

    if (error) throw error;

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