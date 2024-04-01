// components/PolkadotWalletConnect.tsx
import React, { useState, useEffect } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useTxData } from '../../context/TxDataContext';
import ProjectDetailsForm from '../../components/ProjectDetailsForm';
import { supabaseAnon } from '../../lib/supabaseClient';

const providers = [
  { name: 'Aleph Zero Testnet', url: 'wss://ws.test.azero.dev' },
  { name: 'Polkadot', url: 'wss://rpc.polkadot.io' },
  // Add more providers as needed
];

const updateTokensTable = async (tokens: any[]) => {
  try {
    for (const token of tokens) {
      const { data: existingTokens, error: tokenError } = await supabaseAnon
        .from('tokens')
        .select('*')
        .eq('symbol', token.symbol)
        .eq('blockchain', 'Polkadot');

      if (tokenError) {
        console.error('Error checking token existence:', tokenError);
      } else if (existingTokens.length === 0) {
        // Token doesn't exist, insert it into the table
        const { data: newToken, error: insertError } = await supabaseAnon
          .from('tokens')
          .insert([
            {
              symbol: token.symbol,
              name: token.name,
              decimals: token.decimals,
              contract_address: token.contractAddress,
              policy_id: token.policy_id,
              blockchain: 'Polkadot',
            },
          ]);

        if (insertError) {
          console.error('Error inserting new token:', insertError);
        } else {
          console.log('New token inserted:', newToken);
        }
      } else {
        console.log('Token already exists:', existingTokens);
      }
    }
  } catch (error) {
    console.error('Error updating tokens table:', error);
  }
};

const PolkadotWalletConnect: React.FC = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null); // State to hold the selected account
  const [status, setStatus] = useState<string>('Not connected');
  const [api, setApi] = useState<ApiPromise | null>(null);
  const { txData, setTxData } = useTxData();
  const [selectedProvider, setSelectedProvider] = useState(providers[0].url); // Default to the first provider
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenDecimals, setTokenDecimals] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [walletExists, setWalletExists] = useState(false);

  const setup = async () => {
    setLoading(true);
    const wsProvider = new WsProvider(selectedProvider);
    const api = await ApiPromise.create({ provider: wsProvider });
    const decimals = api.registry.chainDecimals[0];
    setTokenDecimals(decimals);
    setApi(api);
    console.log(api, selectedProvider )
    setLoading(false);
  };

  const fetchTokenBalances = async (accountAddress: any) => {
  try {
    if (!api) return [];

    // Get the available token balances for the account
    const tokenBalances = await api.derive.balances.all(accountAddress);
    console.log('Token Balances:', tokenBalances);
    // Extract the token symbols and balances
    const tokens = Object.entries(tokenBalances.lockedBreakdown).map(([symbol, balance]) => ({
      symbol,
      balance: balance.toString(),
      name: symbol,
      decimals: 0,
      contractAddress: '',
      policy_id: '',
      blockchain: 'Polkadot',
    }));

    // Add the native token balance
    const { data: { free: nativeBalance } }: any = await api.query.system.account(accountAddress);
    const selectedProviderName = providers.find((provider) => provider.url === selectedProvider)?.name || '';
    const nativeToken = {
      symbol: api.registry.chainTokens[0], // Get the native token symbol
      balance: nativeBalance.toString(),
      name: selectedProviderName,
      decimals: api.registry.chainDecimals[0],
      contractAddress: '', 
      policy_id: '',
      blockchain: 'Polkadot',
    };
    tokens.unshift(nativeToken);  // Add the native token at the beginning of the list

    console.log('All Tokens:', tokens, tokenBalances);
    return tokens;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
};

  useEffect(() => { 
    setup();
  }, []);

  useEffect(() => {
    setTxData({ ...txData, provider: selectedProvider });
    setup();
    console.log("txData");
  }, [selectedProvider]);

  useEffect(() => {
    if (!api) return;

    (async () => {
      const time = await api.query.timestamp.now();
      console.log(`Last timestamp: ${time.toPrimitive() as String}`);
    })();

    /*return () => {
      api.disconnect();
    };*/
  }, [api]);

  const enableAndFetchAccounts = async () => {
    if (typeof window === 'undefined') return null;
    const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
    const extensions = await web3Enable('Your App Name');
    if (extensions.length === 0) return null;
    const accounts = await web3Accounts();
    console.log('Accounts:', accounts);
    return accounts.length > 0 ? accounts : null;
  };

  useEffect(() => {
    const checkForWalletConnection = async () => {
      const isDisconnected = localStorage.getItem('isWalletDisconnected') === 'true';
      if (isDisconnected) {
        setStatus('Not connected');
        return;
      }

      const accounts = await enableAndFetchAccounts();
      if (accounts) {
        setAccounts(accounts);
        console.log(accounts)
        setStatus('Connected');
        setSelectedAccount(accounts[0].address); 
        setTxData({ ...txData, wallet: accounts[0].address });
      } else {
        setStatus('Not connected');
      }
    };
    checkForWalletConnection();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
        if (!api || !txData.wallet) {
            setBalance('');
            return;
        }

        api.query.system.account(
          txData.wallet, 
          ({ data: { free: balance } }: {data: {free: any}}) => {
            const balanceInPlanck = balance.toBigInt();
            const balanceInDOT = balanceInPlanck ;
            const finalBalance = Number(balanceInDOT) / (10 ** (tokenDecimals));
            setBalance((finalBalance).toFixed(4));
            console.log('Balance:', finalBalance);
          })
        //const { data: { free: balance } } = await (api.query.system.account(txData.wallet) as any);
    };

    fetchBalance();
}, [api, txData.wallet]);

useEffect(() => {
  const fetchAndSetTokens = async () => {
    if (selectedAccount && api) {
      const fetchedTokens: any = await fetchTokenBalances(selectedAccount);
      setTokens(fetchedTokens);
      await updateTokensTable(fetchedTokens); // Update the tokens table
    }
  };

  fetchAndSetTokens();
}, [selectedAccount, api]);

useEffect(() => {
  setTxData({ ...txData, tokens });
}, [tokens]);

  const connectPolkadotWallet = async () => {
    setStatus('Connecting...');
    const accounts = await enableAndFetchAccounts();
    if (accounts) {
      setAccounts(accounts);
      setStatus('Connected');
      setSelectedAccount(accounts[0].address); 
      setTxData({ ...txData, wallet: accounts[0].address });
      localStorage.removeItem('isWalletDisconnected');
    } else {
      setStatus('No extension found or access denied');
    }
  };

  const disconnectPolkadotWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setTxData({ ...txData, wallet: '' });
    setStatus('Not connected');
    localStorage.setItem('isWalletDisconnected', 'true');
  };

  const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(event.target.value);
    setTxData({ ...txData, wallet: event.target.value });
    console.log(event.target.value);
  };

  return (
    <div>
      <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}>
        {providers.map((provider, index) => (
          <option key={index} value={provider.url}>{provider.name}</option>
        ))}
      </select>
      {status !== 'Connected' ? (
        <button onClick={connectPolkadotWallet}>Connect Polkadot Wallet</button>
      ) : (
        <>
          <button onClick={disconnectPolkadotWallet}>Disconnect Polkadot Wallet</button>
          <select value={selectedAccount || ''} onChange={handleAccountChange}>
            {accounts.map((account) => (
              <option key={account.meta.name + account.meta.source} value={account.address}>
                {account.meta.name + " " + account.meta.source}
              </option>
            ))}
          </select>
        </>
      )}
      <p>Status: {status}</p>
      {accounts.length > 0 && (
        <div>
          {selectedAccount && (
            <ProjectDetailsForm walletAddress={selectedAccount} blockchain="Polkadot" />
          )}
          <h4>Balance</h4>
          <div>
            <p>Account Address: {selectedAccount}</p>
            <p>Balance: {loading ? 'Loading...' : balance}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolkadotWalletConnect;
