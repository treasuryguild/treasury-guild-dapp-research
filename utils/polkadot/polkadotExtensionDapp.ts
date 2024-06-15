let web3Enable: any;
let web3Accounts: any;

if (typeof window !== 'undefined') {
  // Importing the module dynamically only on the client side
  import('@polkadot/extension-dapp').then((module) => {
    web3Enable = module.web3Enable;
    web3Accounts = module.web3Accounts;
  });
}

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
