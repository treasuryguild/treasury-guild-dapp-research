// pages/api/auth/cardano/nonce.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateNonce } from '@meshsdk/core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userAddress } = req.body;

  if (!userAddress) {
    return res.status(400).json({ message: 'Missing user address' });
  }

  try {
    //const nonce = generateNonce('Sign to login in to Mesh: ');
    const nonce = 'Sign to login in to Mesh: ';
    // TODO: Store the nonce in your database associated with the userAddress
    // For example: await storeNonceInDatabase(userAddress, nonce);

    res.status(200).json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}