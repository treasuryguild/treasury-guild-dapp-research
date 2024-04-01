import { supabaseAnon } from '../lib/supabaseClient';

async function getOrCreateToken(token) {
  const { data: tokenData, error: tokenError } = await supabaseAnon
    .from('tokens')
    .select('id')
    .eq('name', token.name)
    .single('id');

  if (tokenError) {
    const { data: newTokenData, error: newTokenError } = await supabaseAnon
      .from('tokens')
      .insert([
        {
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          contract_address: token.contractAddress
        }
      ])
      .select('*');

    if (newTokenError) {
      console.error('Error inserting new token:', newTokenError);
      throw newTokenError;
    }

    return newTokenData[0].id;
  }

  return tokenData.id;
}

async function getWalletId(address) {
  const { data: walletData, error: walletError } = await supabaseAnon
    .from('wallets')
    .select('id')
    .eq('address', address)
    .single();

  if (walletError) {
    return null;
  }

  return walletData.id;
}

async function getOrCreateExternalWalletId(address) {
  const { data: externalWalletData, error: externalWalletError } = await supabaseAnon
    .from('external_wallets')
    .select('id')
    .eq('address', address)
    .single();

  if (externalWalletError) {
    const { data: newExternalWalletData, error: newExternalWalletError } = await supabaseAnon
      .from('external_wallets')
      .insert([{ address }])
      .select('id');

    if (newExternalWalletError) {
      console.error('Error inserting new external wallet:', newExternalWalletError);
      throw newExternalWalletError;
    }

    return newExternalWalletData[0].id;
  }

  return externalWalletData.id;
}

async function insertTransaction(transaction) {
  const { data: transactionData, error: transactionError } = await supabaseAnon
    .from('transactions')
    .insert([transaction])
    .select('id');

  if (transactionError) {
    console.error('Error inserting transaction:', transactionError);
    throw transactionError;
  }

  return transactionData[0].id;
}

async function insertContributions(contributions) {
  const contributionData = contributions.map(contribution => ({
    name: contribution.name,
    labels: contribution.labels,
    task_date: contribution.taskDate
  }));

  const { data: insertedContributions, error: contributionError } = await supabaseAnon
    .from('contributions')
    .insert(contributionData)
    .select('id');

  if (contributionError) {
    console.error('Error inserting contributions:', contributionError);
    throw contributionError;
  }

  return insertedContributions.map(contribution => contribution.id);
}

async function insertTransactionInputs(inputs, transactionId, contributionId) {
  const flattenedInputData = await Promise.all(
    inputs.flatMap(async input => {
      return Promise.all(
        input.tokens.map(async token => {
          const tokenId = await getOrCreateToken(token.token);
          return {
            transaction_id: transactionId,
            contribution_id: contributionId,
            from_address: input.fromAddress,
            token_id: tokenId,
            amount: token.amount
          };
        })
      );
    })
  );

  const deepFlattenedInputData = flattenedInputData.flat();

  console.log('Deep flattened input data:', deepFlattenedInputData);

  const { data: insertedInputs, error: inputsError } = await supabaseAnon
    .from('transaction_inputs')
    .insert(deepFlattenedInputData);

  if (inputsError) {
    console.error('Error inserting transaction inputs:', inputsError);
    throw inputsError;
  }
}

async function insertTransactionOutputs(outputs, transactionId, contributionId) {
  const flattenedOutputData = await Promise.all(
    outputs.flatMap(async output => {
      const walletId = await getWalletId(output.toAddress);
      const externalWalletId = walletId ? null : await getOrCreateExternalWalletId(output.toAddress);

      return Promise.all(
        output.tokens.map(async token => {
          const tokenId = await getOrCreateToken(token.token);
          return {
            transaction_id: transactionId,
            contribution_id: contributionId,
            role: output.role,
            to_address: output.toAddress,
            token_id: tokenId,
            amount: token.amount,
            wallet_id: walletId,
            external_wallet_id: externalWalletId
          };
        })
      );
    })
  );

  const deepFlattenedOutputData = flattenedOutputData.flat();

  console.log('Deep flattened output data:', deepFlattenedOutputData);

  const { data: insertedOutputs, error: outputsError } = await supabaseAnon
    .from('transaction_outputs')
    .insert(deepFlattenedOutputData);

  if (outputsError) {
    console.error('Error inserting transaction outputs:', outputsError);
    throw outputsError;
  }
}

export default async function updateTransactionTables(jsonData) {
  const { transactionHash, blockNumber, fromAddress, toAddress, success, fee, project_id, contributions } = jsonData;

  // Insert the transaction into the transactions table
  const transaction = {
    hash: transactionHash,
    block_number: blockNumber,
    from_address: fromAddress,
    to_address: toAddress,
    success: success,
    project_id: project_id,
    fee: fee
  };

  const transactionId = await insertTransaction(transaction);

  // Insert the contributions and get their IDs
  const contributionIds = await insertContributions(contributions);

  // Insert the transaction inputs and outputs for each contribution
  for (let i = 0; i < contributions.length; i++) {
    const contribution = contributions[i];
    const contributionId = contributionIds[i];

    await insertTransactionInputs(contribution.inputs, transactionId, contributionId);
    await insertTransactionOutputs(contribution.outputs, transactionId, contributionId);
  }

  console.log('Transaction tables updated successfully');
}