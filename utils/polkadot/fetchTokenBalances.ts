// utils/fetchTokenBalances.ts
import { ApiPromise } from '@polkadot/api';
import { PROVIDERS } from '../../constants/providers';

export const fetchTokenBalances = async (api: ApiPromise, accountAddress: string, selectedProvider: string) => {
  try {
    if (!api) return [];

    // Get the available token balances for the account
    const tokenBalances = await api.derive.balances.all(accountAddress);
    
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
    const selectedProviderName = PROVIDERS.find((provider) => provider.url === selectedProvider)?.name || '';
    const nativeToken = {
      symbol: api.registry.chainTokens[0],
      balance: nativeBalance.toString(),
      name: selectedProviderName,
      decimals: api.registry.chainDecimals[0],
      contractAddress: '',
      policy_id: '',
      blockchain: 'Polkadot',
    };
    tokens.unshift(nativeToken);

    return tokens;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
};