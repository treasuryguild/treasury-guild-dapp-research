import React, { ChangeEvent, useState, useEffect } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const PolkaWalletConnect: React.FC = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null); 
  const [status, setStatus] = useState<string>('Not connected');
  const [api, setApi] = useState<ApiPromise | null>(null);

  const setup = async () => {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    setApi(api);
  };

  const handleConnection = async () => {
    const extensions = await web3Enable('Your App Name');
    if (!extensions) {
        throw Error('No extension found or access denied');
    }
    
    const allAccounts = await web3Accounts();  
    console.log(allAccounts);
    setAccounts(allAccounts);

    if (allAccounts.length === 1) {
      setSelectedAccount(allAccounts[0]);
    }
  }

const handleAccountSelection = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = e.target.value;

    const account = accounts.find((acc) => acc.address === selectedAddress);

    if (!account) {
        throw Error('Account not found');
    }

    setSelectedAccount(account);
}

useEffect(() => { 
    setup();
}, []);

  useEffect(() => {
    if (!api) return;

    (async () => {
        const time = await api.query.timestamp.now();
        console.log(`Last timestamp: ${time.toPrimitive()}`);
    })();
  }, [api]);

  return (
    <div>
      {accounts.length === 0 ? (<button onClick={handleConnection}>connect</button>) : null}

      {accounts.length > 0 && !selectedAccount ? (
        <>
          <select onChange={handleAccountSelection} value={selectedAccount?.address || ''}>
            <option key="1" value="" disabled hidden>Choose your account</option>
            {accounts.map((account) => (
                <option key={account.address+account.meta.source} value={account.address}>{account.address}</option>
            ))}
          </select>
        </>
      ) : null}

      {accounts.length > 0 && selectedAccount ? selectedAccount.address : null}
    </div>
  );
};

export default PolkaWalletConnect;
