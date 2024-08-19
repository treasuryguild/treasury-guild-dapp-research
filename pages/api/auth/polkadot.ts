// pages/api/auth/polkadot.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address, signature, message } = req.body;

  if (!address || !signature || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await cryptoWaitReady();
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });

    const { isValid } = signatureVerify(message, signature, address);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Check if user exists in Supabase
    let { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', address)
      .single();

    if (!user) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ wallet_address: address })
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
        wallet_address: address
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}