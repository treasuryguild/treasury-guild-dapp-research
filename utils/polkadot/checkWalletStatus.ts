// utils/polkadot/checkWalletStatus.ts
import { ApiPromise } from '@polkadot/api';
import { PROVIDERS, SUBSCAN_URLS } from '../../constants/providers';
import { createSupabaseAuthClient, supabasePublic } from '../../lib/supabaseClient';

async function getProjectIdByAddress(address: any) {
    const { data, error } = await supabasePublic
      .from('wallets')
      .select('project_id')
      .eq('address', address)
      .single();
  
    if (error) {
      console.error('Error retrieving project_id from wallets table:', error.message);
      return null;
    }
  
    return data ? data.project_id : null;
}

function formatDate(timestamp: any) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function getExistingTransactionHashes() {
    const { data: transactions, error: transactionsError } = await supabasePublic
        .from('transactions')
        .select('hash');

    const { data: pendingTransactions, error: pendingTransactionsError } = await supabasePublic
        .from('pending_transactions')
        .select('hash');

    if (transactionsError || pendingTransactionsError) {
        console.error('Error fetching existing transaction hashes from Supabase:', transactionsError?.message || pendingTransactionsError?.message);
        return [];
    }

    const allTransactions = [...transactions, ...pendingTransactions];
    return allTransactions.map(transaction => transaction.hash);
}

async function fetchTransactionDetails(subscanUrl: string, address: string) {
    const apiUrl = `${subscanUrl}/api/v2/scan/transfers`;
    const params = {
      address: address,
      row: 10,
      page: 0,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();

      if (data && data.data && data.data.transfers && data.data.transfers.length > 0) {
        // Sort the transfers by timestamp in descending order
        const sortedTransfers = data.data.transfers.sort((a: any, b: any) => b.block_timestamp - a.block_timestamp);
        return sortedTransfers;
      }
    }

    return [];
}

export const checkWalletStatus = async (api: ApiPromise, accountAddress: string, selectedProvider: string, authToken: string) => {
    console.log('Checking wallet status...');
    const projectId = await getProjectIdByAddress(accountAddress);
    const supabaseAuthClient = createSupabaseAuthClient(authToken);

    try {
        if (!api) return [];

        console.log('Token balances:');

        const selectedProviderName = PROVIDERS.find((provider) => provider.url === selectedProvider)?.name || '';
        const subscanUrl = SUBSCAN_URLS.find((subscan) => subscan.name === selectedProviderName)?.url || '';

        if (subscanUrl) {
            const transactionDetails = await fetchTransactionDetails(subscanUrl, accountAddress);
            const existingTransactionHashes = await getExistingTransactionHashes();

            const newTransactions = transactionDetails.filter((transaction: any) =>
                !existingTransactionHashes.includes(transaction.hash)
            );

            console.log('New transactions:', newTransactions, 'Transaction details:', transactionDetails);

            if (newTransactions.length > 0) {
                const tokenDecimals = api.registry.chainDecimals[0];
                const tokenSymbol = api.registry.chainTokens[0];
                console.log("newTransactions", newTransactions);

                const groupedTransactions: { [hash: string]: any[] } = {};
                for (const transaction of newTransactions) {
                    if (!groupedTransactions[transaction.hash]) {
                        groupedTransactions[transaction.hash] = [];
                    }
                    groupedTransactions[transaction.hash].push(transaction);
                    console.log("groupedTransactions", groupedTransactions);
                }

                for (const transactionHash in groupedTransactions) {
                    const transactions = groupedTransactions[transactionHash];
                    const firstTransaction = transactions[0];
                    const txType = firstTransaction.from === accountAddress ? 'outgoing' : 'incoming';
                    const formattedDate = formatDate(firstTransaction.block_timestamp * 1000);
                    const network = selectedProvider;

                    const contributions = transactions.map((transaction) => ({
                        name: txType === 'incoming' ? 'Incoming Rewards' : 'Outgoing Transaction',
                        labels: txType === 'incoming' ? ['Rewards'] : ['Transaction'],
                        sub_group: txType === 'incoming' ? [''] : [''],
                        taskDate: formattedDate,
                        inputs: [
                            {
                                fromAddress: transaction.from,
                                tokens: [
                                    {
                                        token: {
                                            symbol: tokenSymbol,
                                            name: selectedProviderName,
                                            decimals: tokenDecimals,
                                            contractAddress: '',
                                        },
                                        amount: transaction.amount,
                                    },
                                ],
                            },
                        ],
                        outputs: [
                            {
                                toAddress: transaction.to,
                                tokens: [
                                    {
                                        token: {
                                            symbol: tokenSymbol,
                                            name: selectedProviderName,
                                            decimals: tokenDecimals,
                                            contractAddress: '',
                                        },
                                        amount: transaction.amount,
                                    },
                                ],
                            },
                        ],
                    }));

                    const jsonData = {
                        transactionHash: firstTransaction.hash,
                        blockNumber: firstTransaction.block_num,
                        fromAddress: firstTransaction.from,
                        toAddress: firstTransaction.to,
                        success: true,
                        fee: firstTransaction.fee,
                        project_id: projectId,
                        tx_type: txType,
                        contributions,
                        network: network
                    };

                    try {
                        if (jsonData.project_id) {
                            const { data, error } = await supabaseAuthClient
                                .from('pending_transactions')
                                .upsert(
                                    { 
                                        hash: jsonData.transactionHash, 
                                        json_data: jsonData,
                                        wallet_address: accountAddress 
                                    },
                                    { 
                                        onConflict: 'hash',
                                        ignoreDuplicates: true 
                                    }
                                );

                            if (error) {
                                console.error('Error upserting transaction:', error);
                            } else {
                                console.log('Transaction upserted successfully:', jsonData.transactionHash);
                            }
                        }
                    } catch (error) {
                        console.error('Error sending transaction details to Supabase:', error);
                    }
                }
            }

            return "Wallet status: Up to date";
        } else {
            console.log('No Subscan URL found for the selected provider.');
            return "Wallet status: No Subscan URL found";
        }
    } catch (error) {
        console.error('Error fetching token balances:', error);
        return "Wallet status: Error";
    }
};