// pages/api/auth/cardano/verify.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { checkSignature } from '@meshsdk/core';
import jwt from 'jsonwebtoken';

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
    // TODO: Retrieve the nonce from your database
    // const nonce = await getNonceFromDatabase(userAddress);
    const nonce = 'Sign to login in to Mesh: '; // Temporary placeholder
    

    // Verify the signature using MeshJS
    const isValid = checkSignature(nonce, userAddress, signature);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // If signature is valid, create a JWT
    const token = jwt.sign({ address: userAddress }, JWT_SECRET, { expiresIn: '1d' });

    // TODO: Update or delete the used nonce in your database
    // await updateNonceInDatabase(userAddress);

    res.status(200).json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}