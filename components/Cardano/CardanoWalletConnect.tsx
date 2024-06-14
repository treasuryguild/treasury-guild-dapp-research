// components/PolkadotWalletConnect.tsx
import React, { useState, useEffect } from 'react';
import { useTxData } from '../../context/TxDataContext';
import ProjectDetailsForm from '../../components/ProjectDetailsForm';
import { useWallet } from '@meshsdk/react';
import { CardanoWallet } from '@meshsdk/react';

const CardanoWalletConnect: React.FC = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { txData, setTxData } = useTxData();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null); // State to hold the selected account
  const [status, setStatus] = useState<string>('Not connected');
  
  async function getAssets() {
    if (wallet) {
      setLoading(true);
      const _assets = await wallet.getAssets();
      setAssets(_assets);
      setLoading(false);
    }
  }

  return (
    <div>
      <CardanoWallet />
      {connected && (
        <>
          {assets ? (
            <pre>
              <code className="language-js">
                {JSON.stringify(assets, null, 2)}
              </code>
            </pre>
          ) : (
            <button
              type="button"
              onClick={() => getAssets()}
              disabled={loading}
              style={{
                margin: "8px",
                backgroundColor: loading ? "orange" : "grey",
              }}
            >
              Get Wallet Assets
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CardanoWalletConnect;
