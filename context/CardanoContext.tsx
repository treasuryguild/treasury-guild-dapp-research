// ../context/CardanoDataContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface CardanoData {
  group: string;
  project: string;
  project_id: string;
  project_website: string;
  project_type:string;
  logo_url: string;
  wallet: string;
  ada_wallet_stake_address: string;
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

interface CardanoDataContextProps {
  cardanoData: CardanoData;
  setCardanoData: React.Dispatch<React.SetStateAction<CardanoData>>;
}

export const CardanoDataContext = createContext<CardanoDataContextProps | undefined>(undefined);

interface CardanoDataProviderProps {
  children: ReactNode;
}

export const CardanoDataProvider: React.FC<CardanoDataProviderProps> = ({ children }) => {
  const [cardanoData, setCardanoData] = useState<CardanoData>({ 
    group: '',
    project:'',
    project_id:'',
    project_website:'',
    project_type:'',
    logo_url:'',
    wallet:'',
    ada_wallet_stake_address:'',
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
    provider: '', 
    tokens: [],
    authToken: null,
  });

  return (
    <CardanoDataContext.Provider value={{ cardanoData, setCardanoData }}>
      {children}
    </CardanoDataContext.Provider>
  );
};

export const useCardanoData = (): CardanoDataContextProps => {
  const context = useContext(CardanoDataContext);
  if (!context) {
    throw new Error("useCardanoData must be used within a CardanoDataProvider");
  }
  return context;
}