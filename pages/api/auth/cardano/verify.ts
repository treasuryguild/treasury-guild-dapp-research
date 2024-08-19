// pages/api/auth/cardano/verify.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { checkSignature } from '@meshsdk/core';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
    const { data: nonceData, error: nonceError } = await supabase
      .from('nonces')
      .select('nonce')
      .eq('user_address', userAddress)
      .single();

    if (nonceError) throw nonceError;
    if (!nonceData) return res.status(404).json({ message: 'Nonce not found' });

    const nonce = nonceData.nonce;

    // Verify the signature using MeshJS
    const isValid = checkSignature(nonce, userAddress, signature);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Check if user exists in Supabase
    let { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', userAddress)
      .single();

    if (!user) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ wallet_address: userAddress })
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    if (error && error.code !== 'PGRST116') throw error;

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id,
        aud: 'authenticated',
        role: 'authenticated',
        wallet_address: userAddress
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Delete the used nonce from Supabase
    const { error: deleteError } = await supabase
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