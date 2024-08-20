// ../functions/processTransaction.js
import { createClient } from '@supabase/supabase-js';
import updateTransactionTables from '../utils/updateTransactionTables';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function handler(event, context) {
  const contentType = event.headers['content-type'];
  if (contentType !== 'application/json') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid content type. Expected application/json.' }),
    };
  }

  const { record } = JSON.parse(event.body);
  const jsonData = record.json_data;

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