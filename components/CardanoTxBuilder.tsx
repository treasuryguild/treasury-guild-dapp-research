import React, { useState, useEffect } from 'react';

export default function CardanoTxBuilder() {
  const [metadata, setMetadata] = useState('');
  const [accountAddress, setAccountAddress] = useState('');

  // On component mount, enable the extension and fetch accounts
  useEffect(() => {
    const init = async () => {
      console.log('Initializing Cardano extension');
    };
    init();
  }, []);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log('Submitting metadata:', metadata);
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
