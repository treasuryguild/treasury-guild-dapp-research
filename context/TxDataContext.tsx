import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TxData {
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
  // other properties of TxData...
}

interface TxDataContextProps {
  txData: TxData;
  setTxData: React.Dispatch<React.SetStateAction<TxData>>;
}

export const TxDataContext = createContext<TxDataContextProps | undefined>(undefined);

interface TxDataProviderProps {
  children: ReactNode;
}

export const TxDataProvider: React.FC<TxDataProviderProps> = ({ children }) => {
  const [txData, setTxData] = useState<TxData>({ 
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
  provider: '',
  tokens: [],
   /* initialize other properties as needed */ 
  });

  return (
    <TxDataContext.Provider value={{ txData, setTxData }}>
      {children}
    </TxDataContext.Provider>
  );
};

export const useTxData = (): TxDataContextProps => {
  const context = useContext(TxDataContext);
  if (!context) {
    throw new Error("useTxData must be used within a TxDataProvider");
  }
  return context;
}