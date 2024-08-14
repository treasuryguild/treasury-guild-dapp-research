// ../context/PolkadotDataContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { PROVIDERS } from '../constants/providers'; 

export interface PolkadotData {
  group: string;
  project: string;
  project_id: string;
  project_website: string;
  project_type:string;
  logo_url: string;
  wallet: string;
  txHash: string;
  monthly_budget_balance: any;
  monthly_wallet_budget_string: string;
  totalAmountsString: string;
  txamounts: any;
  fee: any;
  totalAmounts: any;
  walletTokens: any;
  walletBalanceAfterTx: any;
  balanceString: string;
  txdescription: string;
  formattedDate: string;
  tokenRates: any;
  txtype: string;
  budget_month: string;
  send_message: boolean;
  provider: string;
  tokens: { symbol: string, balance: string }[];
  authToken: string | null;
}

interface PolkadotDataContextProps {
  polkadotData: PolkadotData;
  setPolkadotData: React.Dispatch<React.SetStateAction<PolkadotData>>;
}

export const PolkadotDataContext = createContext<PolkadotDataContextProps | undefined>(undefined);

interface PolkadotDataProviderProps {
  children: ReactNode;
}

export const PolkadotDataProvider: React.FC<PolkadotDataProviderProps> = ({ children }) => {
  const [polkadotData, setPolkadotData] = useState<PolkadotData>({ 
    group: '',
    project:'',
    project_id:'',
    project_website:'',
    project_type:'',
    logo_url:'',
    wallet:'',
    txHash:'',
    monthly_budget_balance: {},
    monthly_wallet_budget_string:'',
    totalAmountsString:'',
    txamounts:{},
    fee:'',
    totalAmounts:{},
    walletTokens:{},
    walletBalanceAfterTx:{},
    balanceString:'',
    txdescription:'',
    formattedDate:'',
    tokenRates:{},
    txtype:'',
    budget_month: new Date().toISOString().slice(0, 7),
    send_message:true,
    provider: PROVIDERS[0].url, // Set the default provider
    tokens: [],
    authToken: null,
  });

  return (
    <PolkadotDataContext.Provider value={{ polkadotData, setPolkadotData }}>
      {children}
    </PolkadotDataContext.Provider>
  );
};

export const usePolkadotData = (): PolkadotDataContextProps => {
  const context = useContext(PolkadotDataContext);
  if (!context) {
    throw new Error("usePolkadotData must be used within a PolkadotDataProvider");
  }
  return context;
}