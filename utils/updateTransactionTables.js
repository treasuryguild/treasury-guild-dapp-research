import { supabaseAdmin } from '../lib/supabaseClient';

async function getOrCreateToken(token) {
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from('tokens')
    .select('id')
    .eq('name', token.name)
    .single('id');

  if (tokenError) {
    const { data: newTokenData, error: newTokenError } = await supabaseAdmin
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

export default async function updateTransactionTables(jsonData) {
  const { transactionHash, blockNumber, fromAddress, toAddress, success, fee, project_id, contributions } = jsonData;

  // Check if the fromAddress exists in the Wallets or ExternalWallets table
  let fromWalletId = '';
  let fromExternalWalletId = null;

  const { data: fromWalletData, error: fromWalletError } = await supabaseAdmin
    .from('wallets')
    .select('id')
    .eq('address', fromAddress)
    .single();

  if (fromWalletError) {
    const { data: fromExternalWalletData, error: fromExternalWalletError } = await supabaseAdmin
      .from('external_wallets')
      .select('id')
      .eq('address', fromAddress)
      .single();

    if (fromExternalWalletError) {
      // If the fromAddress doesn't exist in either table, insert it into the ExternalWallets table
      const { data: newExternalWalletData, error: newExternalWalletError } = await supabaseAdmin
        .from('external_wallets')
        .insert([{ address: fromAddress }])
        .select('id');

      if (newExternalWalletError) {
        console.error('Error inserting new external fromAddress wallet:', newExternalWalletError);
        return;
      }

      fromExternalWalletId = newExternalWalletData[0].id;
    } else {
      fromExternalWalletId = fromExternalWalletData.id;
    }
  } else {
    fromWalletId = fromWalletData.id;
  }

  // Insert the transaction into the transactions table
  const { data: transactionData, error: transactionError } = await supabaseAdmin
    .from('transactions')
    .insert([
      {
        hash: transactionHash,
        block_number: blockNumber,
        from_address: fromAddress,
        to_address: toAddress,
        success: success,
        project_id: project_id,
        fee: fee
      }
    ])
    .select('id');

  if (transactionError) {
    console.error('Error inserting transaction:', transactionError);
    return;
  }

  const transactionId = transactionData[0].id;

  for (const contribution of contributions) {
    const { data: contributionData, error: contributionError } = await supabaseAdmin
      .from('contributions')
      .insert([
        {
          name: contribution.name,
          labels: contribution.labels,
          task_date: contribution.taskDate
        }
      ])
      .select('id');

    if (contributionError) {
      console.error('Error inserting contribution:', contributionError);
      continue;
    }

    const contributionId = contributionData[0].id;

    const inputsPromises = contribution.inputs.map(async input => {
      const tokenId = await getOrCreateToken(input.token);

      return {
        transaction_id: transactionId,
        contribution_id: contributionId,
        from_address: input.fromAddress,
        token_id: tokenId,
        amount: contribution.amount
      };
    });

    const outputsPromises = contribution.outputs.map(async output => {
      const tokenId = await getOrCreateToken(output.token);
      let walletId = output.walletId;
      let externalWalletId = output.externalWalletId;

      // Check if the toAddress exists in the wallets or external_wallets tables
      const { data: toWalletData, error: toWalletError } = await supabaseAdmin
        .from('wallets')
        .select('id')
        .eq('address', output.toAddress)
        .single();

      if (toWalletError) {
        const { data: toExternalWalletData, error: toExternalWalletError } = await supabaseAdmin
          .from('external_wallets')
          .select('id')
          .eq('address', output.toAddress)
          .single();

        if (toExternalWalletError) {
          // If the toAddress doesn't exist in either table, insert it into the external_wallets table
          const { data: newExternalWalletData, error: newExternalWalletError } = await supabaseAdmin
            .from('external_wallets')
            .insert([{ address: output.toAddress }])
            .select('id');

          if (newExternalWalletError) {
            console.error('Error inserting new external toAddress wallet:', newExternalWalletError);
            return;
          }

          externalWalletId = newExternalWalletData[0].id;
          walletId = null;
        } else {
          externalWalletId = toExternalWalletData.id;
          walletId = null;
        }
      } else {
        walletId = toWalletData.id;
        externalWalletId = null;
      }

      return {
        transaction_id: transactionId,
        contribution_id: contributionId,
        role: output.role,
        to_address: output.toAddress,
        token_id: tokenId,
        amount: contribution.amount,
        wallet_id: walletId,
        external_wallet_id: externalWalletId
      };
    });

    const [inputsData, outputsData] = await Promise.all([
      Promise.all(inputsPromises),
      Promise.all(outputsPromises)
    ]);

    const { data: inputsInsertData, error: inputsInsertError } = await supabaseAdmin
      .from('transaction_inputs')
      .insert(inputsData);

    if (inputsInsertError) {
      console.error('Error inserting transaction inputs:', inputsInsertError);
      continue;
    }

    const { data: outputsInsertData, error: outputsInsertError } = await supabaseAdmin
      .from('transaction_outputs')
      .insert(outputsData);

    if (outputsInsertError) {
      console.error('Error inserting transaction outputs:', outputsInsertError);
      continue;
    }
  }

  console.log('Transaction tables updated successfully');
}