import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3FromSource, web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';

// This function now accepts an additional parameter for the accountAddress
async function submitTransaction(accountAddress: string, metadata: any) {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  // Retrieve the signer from the Polkadot{.js} extension
  const injector = await web3FromAddress(accountAddress);
  const signer = injector.signer;

  // Create and sign the transaction using the provided account and signer
  const unsub = await api.tx.yourCustomModule
    .yourTransactionFunction(metadata)
    .signAndSend(accountAddress, { signer }, ({ status }) => {
      if (status.isInBlock) {
        console.log(`Transaction included at blockHash ${status.asInBlock}`);
      }
    });
}

export default function PolkadotTxBuilder() {
  const [metadata, setMetadata] = useState('');
  const [accountAddress, setAccountAddress] = useState('');

  // On component mount, enable the extension and fetch accounts
  useEffect(() => {
    const init = async () => {
      await web3Enable('Your App Name');
      const accounts = await web3Accounts();
      if (accounts.length > 0) {
        // Automatically select the first account (or implement account selection)
        setAccountAddress(accounts[0].address);
      }
    };
    init();
  }, []);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log('Submitting metadata:', metadata);
    // Pass the selected accountAddress to the submitTransaction function
    if(accountAddress) {
      await submitTransaction(accountAddress, metadata).catch(console.error);
    } else {
      console.error('No account connected');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="metadata">Metadata:</label>
      <input
        id="metadata"
        name="metadata"
        type="text"
        value={metadata}
        onChange={(e) => setMetadata(e.target.value)}
      />
      <button type="submit" disabled={!accountAddress}>Submit Transaction</button>
    </form>
  );
};
