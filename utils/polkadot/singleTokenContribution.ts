// utils/singleTokenContribution.ts
import { ApiPromise } from '@polkadot/api';

export const handleSingleTokenContribution = async (
  contribution: any,
  contributionInputs: any[],
  contributionOutputs: any[],
  batchCalls: any[],
  jsonData: any,
  decimals: number,
  api: ApiPromise,
  accountAddress: string,
  txData: any,
  contributor: any
) => {
  const paymentCallMap = new Map();

    let amount = contributor.tokens[0].amount;
    const finalAmount = BigInt(amount) * BigInt(10 ** decimals);
    const transferCall = api.tx.balances.transferAllowDeath(contributor.walletAddress, finalAmount);
    const contributorId = contributor.walletAddress.slice(-6);
    const tokenData = txData.tokens.find((token: any) => token.symbol === contributor.tokens[0].token);
    const contRoles = contributor.role.split(',').map((label: any) => label.trim());

    const paymentKey = `${contributor.walletAddress}-${tokenData.symbol}-${amount}`;
    if (!paymentCallMap.has(paymentKey)) {
      paymentCallMap.set(paymentKey, true);
      batchCalls.push(transferCall);
    }

    const remarkData = {
      Contribution: contribution.name,
      Role: contRoles,
      Labels: contribution.labels.split(',').map((label: any) => label.trim()),
      Date: contribution.date,
      Tokens: [{ token: contributor.tokens[0].token, amount: amount.toString() }],
      ContributorId: contributorId,
    };
    const remarkMessage = JSON.stringify(remarkData);
    const remarkCall = api.tx.system.remark(remarkMessage);
    batchCalls.push(remarkCall);

    // Check if the contributor's input data already exists in contributionInputs
    const existingInput = contributionInputs.find(
      (input) =>
        input.fromAddress === accountAddress &&
        input.role.every((singleRole: string) => contRoles.includes(singleRole)) &&
        input.tokens.length === 1 &&
        input.tokens[0].token.symbol === tokenData.symbol &&
        input.tokens[0].amount === amount.toString()
    );
    if (!existingInput) {
      contributionInputs.push({
        fromAddress: accountAddress,
        tokens: [{ token: tokenData, amount: amount.toString() }],
        role: contRoles,
      });
    }

    // Check if the contributor's output data already exists in contributionOutputs
    const existingOutput = contributionOutputs.find(
      (output) =>
        output.toAddress === contributor.walletAddress &&
        output.role.every((singleRole: string) => contRoles.includes(singleRole)) &&
        output.tokens.length === 1 &&
        output.tokens[0].token.symbol === tokenData.symbol &&
        output.tokens[0].amount === amount.toString()
    );
    if (!existingOutput) {
      contributionOutputs.push({
        toAddress: contributor.walletAddress,
        tokens: [{ token: tokenData, amount: amount.toString() }],
        role: contRoles,
        walletId: null,
        externalWalletId: null,
      });
    }
  
};