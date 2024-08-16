// pages/api/auth/cardano/nonce.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateNonce } from '@meshsdk/core';
import { supabasePublic } from '../../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userAddress } = req.body;

  if (!userAddress) {
    return res.status(400).json({ message: 'Missing user address' });
  }

  try {
    const nonce = generateNonce('Sign to login in to Mesh: ');

    // Store or update the nonce in Supabase
    const { data, error } = await supabasePublic
      .from('nonces')
      .upsert({ user_address: userAddress, nonce }, { onConflict: 'user_address' });

    if (error) throw error;

    res.status(200).json({ nonce });
  } catch (error) {
    console.error('Error generating or storing nonce:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}