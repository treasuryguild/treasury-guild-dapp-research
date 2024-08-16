// utils/updateTokensTable.ts
import { supabasePublic } from '../lib/supabaseClient';

export const updateTokensTable = async (tokens: any[]) => {
    try {
      for (const token of tokens) {
        const { data: existingTokens, error: tokenError } = await supabasePublic
          .from('tokens')
          .select('*')
          .eq('symbol', token.symbol)
          .eq('blockchain', 'Polkadot');
  
        if (tokenError) {
          console.error('Error checking token existence:', tokenError);
        } else if (existingTokens.length === 0) {
          const { data: newToken, error: insertError } = await supabasePublic
            .from('tokens')
            .insert([
              {
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                contract_address: token.contractAddress,
                policy_id: token.policy_id,
                blockchain: 'Polkadot',
              },
            ]);
  
          if (insertError) {
            console.error('Error inserting new token:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating tokens table:', error);
    }
  };