// pages/api/auth/polkadot.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';

const JWT_SECRET = process.env.JWT_SECRET!;

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

    const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}