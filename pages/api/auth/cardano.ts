// pages/api/auth/cardano.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET!;

function verifyCardanoSignature(message: string, signature: string, publicKey: string): boolean {
  try {
    const messageBuffer = Buffer.from(message);
    const signatureBuffer = Buffer.from(signature, 'hex');
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');

    // Cardano uses Ed25519 signatures
    return crypto.verify(
      'ed25519',
      messageBuffer,
      publicKeyBuffer,
      signatureBuffer
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address, signature, message, publicKey } = req.body;

  if (!address || !signature || !message || !publicKey) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Verify the signature
    const isValid = verifyCardanoSignature(message, signature, publicKey);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // If signature is valid, create a JWT
    const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}