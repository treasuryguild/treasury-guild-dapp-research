// pages/api/auth/cardano/verify.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { checkSignature } from '@meshsdk/core';
import jwt from 'jsonwebtoken';
import { supabasePublic } from '../../../../lib/supabaseClient';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userAddress, signature } = req.body;

  if (!userAddress || !signature) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Retrieve the nonce from Supabase
    const { data, error } = await supabasePublic
      .from('nonces')
      .select('nonce')
      .eq('user_address', userAddress)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Nonce not found' });

    const nonce = data.nonce;

    // Verify the signature using MeshJS
    const isValid = checkSignature(nonce, userAddress, signature);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // If signature is valid, create a JWT
    const token = jwt.sign({ address: userAddress }, JWT_SECRET, { expiresIn: '1d' });

    // Delete the used nonce from Supabase
    const { error: deleteError } = await supabasePublic
      .from('nonces')
      .delete()
      .eq('user_address', userAddress);

    if (deleteError) throw deleteError;

    res.status(200).json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}