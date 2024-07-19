// utils/polkadot/polkadotExtensionDapp.ts

let web3Enable: any;
let web3Accounts: any;

export const initPolkadotExtension = async () => {
  if (typeof window !== 'undefined') {
    const { web3Enable: enable, web3Accounts: accounts } = await import('@polkadot/extension-dapp');
    web3Enable = enable;
    web3Accounts = accounts;
  }
};

export const enableExtension = async (appName: string) => {
  if (typeof window === 'undefined' || !web3Enable) return;
  const extensions = await web3Enable(appName);
  if (extensions.length === 0) {
    throw new Error('No Polkadot extension found');
  }
};

export const getAccounts = async () => {
  if (typeof window === 'undefined' || !web3Accounts) return [];
  const accounts = await web3Accounts();
  return accounts;
};