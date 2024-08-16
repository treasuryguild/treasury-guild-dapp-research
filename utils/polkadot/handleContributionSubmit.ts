// utils/polkadot/handleContributionSubmit.ts
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { SupabaseClient } from '@supabase/supabase-js';
import updateTransactionTables from '../updateTransactionTables';

const TESTING_MODE = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';


interface Contribution {
  name: string;
  labels: string;
  sub_group: string;
  date: string;
  contributors: {
    tokens: {
      token: string;
      amount: string;
    }[];
  }[];
}

export default async function handleContributionSubmit(
  contributions: Contribution[],
  wsProvider: string,
  txData: any,
  generateBatchCalls: (
    contributions: Contribution[],
    api: ApiPromise,
    decimals: number,
    wallet: string
  ) => Promise<{ batchCalls: any[]; jsonData: any }>,
  checkWalletBalance: (token: { token: string }, requiredAmount: number) => Promise<void>,
  setTransactionStatus: (status: string) => void,
  supabaseAuthClient: SupabaseClient | null
) {
  if (typeof window === 'undefined') return null;
  await web3Enable('Your App Name');
  const injector = await web3FromAddress(txData.wallet);
  if (!injector.signer) {
    console.error('Signer not found. Make sure a wallet extension is installed and the account is accessible.');
    return;
  }

  if (!wsProvider) {
    console.error('Blockchain provider is not set. Please select a provider.');
    return;
  }

  try {
    const provider = new WsProvider(wsProvider);
    const api = await ApiPromise.create({ provider });
    const decimals = api.registry.chainDecimals[0];

    const requiredTokens: { [key: string]: number } = {};

    for (const contribution of contributions) {
      for (const contributor of contribution.contributors) {
        for (const token of contributor.tokens) {
          const tokenKey = token.token;
          requiredTokens[tokenKey] = (Number(requiredTokens[tokenKey]) || 0) + Number(token.amount);
        }
      }
    }

    for (const [tokenKey, requiredAmount] of Object.entries(requiredTokens)) {
      const token = { token: tokenKey };
      await checkWalletBalance(token, requiredAmount);
    }

    const { batchCalls, jsonData } = await generateBatchCalls(contributions, api, decimals, txData.wallet);

    setTransactionStatus('in_progress');
    const batch = api.tx.utility.batchAll(batchCalls);
    const tx = batch;
    const unsub = await batch.signAndSend(txData.wallet, { signer: injector.signer }, async ({ events = [], status }) => {
      if (status.isInBlock) {
        console.log('Transaction included at block hash', status.asInBlock.toHex());
        console.log('Waiting for finalization...');
      } else if (status.isFinalized) {
        console.log('Transaction finalized at block hash', status.asFinalized.toHex());
        
        const signedBlock = await api.rpc.chain.getBlock(status.asFinalized);
        const extrinsicIndex = signedBlock.block.extrinsics.findIndex(
          (ex) => ex.hash.toHex() === tx.hash.toHex()
        );
        const extrinsicHash = signedBlock.block.extrinsics[extrinsicIndex].hash.toHex();
        
        jsonData.transactionHash = extrinsicHash;
        jsonData.success = true;
        jsonData.tx_type = 'Outgoing';
        jsonData.blockNumber = signedBlock.block.header.number.toNumber();
      }

      events.forEach(({ phase, event: { data, method, section } }) => {
        if (section === 'transactionPayment' && method === 'TransactionFeePaid') {
          jsonData.fee = data[1].toString();
        }
      });

      if (status.isFinalized) {
        if (TESTING_MODE) {
          try {
            await updateTransactionTables(jsonData, supabaseAuthClient);
            console.log('Transaction tables updated successfully');
          } catch (error) {
            console.error('Error updating transaction tables:', error);
          }
        } else {
          if (!supabaseAuthClient) {
            console.error('Supabase authenticated client not available');
            return;
          }

          const { data, error } = await supabaseAuthClient
            .from('pending_transactions')
            .insert([{ json_data: jsonData, hash: jsonData.transactionHash }]);

          if (error) {
            console.error('Error inserting pending transaction:', error);
          } else {
            console.log('Pending transaction inserted successfully');
          }
        }
        setTransactionStatus('idle');
        unsub();
      }
    });
  } catch (error) {
    console.error('An error occurred while submitting the transaction:', error);
    setTransactionStatus('idle');
  }
}