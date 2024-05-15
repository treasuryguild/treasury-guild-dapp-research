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
  txData: any
) => {
  for (const contributor of contribution.contributors) {
    let amount = contributor.tokens[0].amount;
    const finalAmount = BigInt(amount) * BigInt(10 ** decimals);
    const transferCall = api.tx.balances.transferAllowDeath(contributor.walletAddress, finalAmount);
    const contributorId = contributor.walletAddress.slice(-6);
    const tokenData = txData.tokens.find((token: any) => token.symbol === contributor.tokens[0].token);

    const remarkData = {
      Contribution: contribution.name,
      Role: contributor.role.split(',').map((label: any) => label.trim()),
      Labels: contribution.labels.split(',').map((label: any) => label.trim()),
      Date: contribution.date,
      Tokens: [{ token: contributor.tokens[0].token, amount: amount.toString() }],
      ContributorId: contributorId,
    };
    const remarkMessage = JSON.stringify(remarkData);
    const remarkCall = api.tx.system.remark(remarkMessage);

    batchCalls.push(transferCall);
    batchCalls.push(remarkCall);

    // Check if the contributor's input data already exists in contributionInputs
    const existingInput = contributionInputs.find(
      (input) =>
        input.fromAddress === accountAddress &&
        input.tokens.length === 1 &&
        input.tokens[0].token.symbol === tokenData.symbol &&
        input.tokens[0].amount === amount.toString()
    );

    if (!existingInput) {
      contributionInputs.push({
        fromAddress: accountAddress,
        tokens: [{ token: tokenData, amount: amount.toString() }],
      });
    }

    // Check if the contributor's output data already exists in contributionOutputs
    const existingOutput = contributionOutputs.find(
      (output) =>
        output.toAddress === contributor.walletAddress &&
        output.role.join(',') === contributor.role &&
        output.tokens.length === 1 &&
        output.tokens[0].token.symbol === tokenData.symbol &&
        output.tokens[0].amount === amount.toString()
    );

    if (!existingOutput) {
      contributionOutputs.push({
        toAddress: contributor.walletAddress,
        tokens: [{ token: tokenData, amount: amount.toString() }],
        role: contributor.role.split(',').map((label: any) => label.trim()),
        walletId: null,
        externalWalletId: null,
      });
    }
  }
};