// updateTransactionTables.js
import { transformContributionsToMetadata } from '../utils/transformContributionsMetadata';

async function getOrCreateTokens(tokens, supabaseClient) {
  const tokenNames = tokens.map(token => token.name);
  const { data: existingTokens, error: selectError } = await supabaseClient
    .from('tokens')
    .select('id, name')
    .in('name', tokenNames);

  if (selectError) {
    console.error('Error selecting tokens:', selectError);
    throw selectError;
  }

  const existingTokenMap = new Map(existingTokens.map(token => [token.name, token.id]));
  const newTokens = tokens.filter(token => !existingTokenMap.has(token.name));

  if (newTokens.length > 0) {
    const { data: insertedTokens, error: insertError } = await supabaseClient
      .from('tokens')
      .insert(newTokens.map(token => ({
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        contract_address: token.contractAddress
      })))
      .select('id, name');

    if (insertError) {
      console.error('Error inserting new tokens:', insertError);
      throw insertError;
    }

    insertedTokens.forEach(token => existingTokenMap.set(token.name, token.id));
  }

  return existingTokenMap;
}

async function getOrCreateExternalWallets(addresses, supabaseClient) {
  const { data: existingWallets, error: selectError } = await supabaseClient
    .from('external_wallets')
    .select('id, address')
    .in('address', addresses);

  if (selectError) {
    console.error('Error selecting external wallets:', selectError);
    throw selectError;
  }

  const existingWalletMap = new Map(existingWallets.map(wallet => [wallet.address, wallet.id]));
  const newAddresses = addresses.filter(address => !existingWalletMap.has(address));

  if (newAddresses.length > 0) {
    const { data: insertedWallets, error: insertError } = await supabaseClient
      .from('external_wallets')
      .insert(newAddresses.map(address => ({ address })))
      .select('id, address');

    if (insertError) {
      console.error('Error inserting new external wallets:', insertError);
      throw insertError;
    }

    insertedWallets.forEach(wallet => existingWalletMap.set(wallet.address, wallet.id));
  }

  return existingWalletMap;
}

function removeDuplicateContributions(contributions) {
  const uniqueContributions = contributions.reduce((acc, contribution) => {
    const key = `${contribution.inputs.map(input => input.fromAddress).join(',')}-${contribution.outputs.map(output => output.toAddress).join(',')}`;
    if (!acc[key]) {
      acc[key] = contribution;
    }
    return acc;
  }, {});

  return Object.values(uniqueContributions);
}

export default async function updateTransactionTables(jsonData, supabaseClient) {
  const { transactionHash, blockNumber, fromAddress, toAddress, success, fee, project_id, network, contributions = [], tx_type } = jsonData;

  const uniqueContributions = removeDuplicateContributions(contributions);
  console.log('Contributions:', contributions);
  const metadata = transformContributionsToMetadata(contributions, transactionHash);
  console.log('Transaction metadata:', metadata);

  const transactionData = {
    hash: transactionHash,
    block_number: blockNumber,
    from_address: fromAddress,
    to_address: toAddress,
    success: success,
    project_id: project_id,
    fee: fee,
    contributions: contributions,
    tx_type: tx_type,
    metadata: metadata,
    network: network
  };

  try {
    const allTokens = contributions.flatMap(contribution =>
      contribution.inputs.flatMap(input =>
        input.tokens.map(token => token.token)
      ).concat(
        contribution.outputs.flatMap(output =>
          output.tokens.map(token => token.token)
        )
      )
    );

    const allExternalAddresses = contributions.flatMap(contribution =>
      contribution.outputs.map(output => output.toAddress)
    );

    const [tokenMap, externalWalletMap] = await Promise.all([
      getOrCreateTokens(allTokens, supabaseClient),
      getOrCreateExternalWallets(allExternalAddresses, supabaseClient)
    ]);

    const { data: insertedTransaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        ...transactionData,
        data: {
          ...transactionData
        }
      })
      .select('id');

    if (transactionError) throw transactionError;

    transactionData.id = insertedTransaction[0].id;

    if (contributions.length > 0) {
      const contributionData = contributions.map(contribution => ({
        transaction_id: transactionData.id,
        name: contribution.name,
        labels: contribution.labels,
        sub_group: contribution.sub_group,
        task_date: contribution.taskDate
      }));

      const { data: insertedContributions, error: contributionError } = await supabaseClient
        .from('contributions')
        .insert(contributionData)
        .select('id');

      if (contributionError) throw contributionError;

      const contributionIds = insertedContributions.map(contribution => contribution.id);

      const inputData = [];
      const outputData = [];

      contributions.forEach((contribution, index) => {
        const contributionId = contributionIds[index];

        if (contribution.inputs) {
          contribution.inputs.forEach(input => {
            if (input.tokens) {
              input.tokens.forEach(token => {
                const tokenId = tokenMap.get(token.token.name);
                inputData.push({
                  transaction_id: transactionData.id,
                  contribution_id: contributionId,
                  from_address: input.fromAddress,
                  token_id: tokenId,
                  amount: token.amount
                });
              });
            }
          });
        }

        if (contribution.outputs) {
          contribution.outputs.forEach(output => {
            const externalWalletId = externalWalletMap.get(output.toAddress);
            if (output.tokens) {
              output.tokens.forEach(token => {
                const tokenId = tokenMap.get(token.token.name);
                outputData.push({
                  transaction_id: transactionData.id,
                  contribution_id: contributionId,
                  to_address: output.toAddress,
                  token_id: tokenId,
                  amount: token.amount,
                  external_wallet_id: externalWalletId
                });
              });
            }
          });
        }
      });

      if (inputData.length > 0) {
        const { error: inputsError } = await supabaseClient
          .from('transaction_inputs')
          .insert(inputData);

        if (inputsError) throw inputsError;
      }

      if (outputData.length > 0) {
        const { error: outputsError } = await supabaseClient
          .from('transaction_outputs')
          .insert(outputData);

        if (outputsError) throw outputsError;
      }
    }

    console.log('Transaction tables updated successfully');
  } catch (error) {
    console.error('Error updating transaction tables:', error);
    throw error;
  }
}