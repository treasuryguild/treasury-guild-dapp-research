// utils/multipleTokensContribution.ts
import { ApiPromise } from '@polkadot/api';

export const handleMultipleTokensContribution = async (
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

    const contributorOutputs: any[] = [];

    for (const token of contributor.tokens) {
      let amount = token.amount;
      const finalAmount = BigInt(amount) * BigInt(10 ** decimals);
      const transferCall = api.tx.balances.transferAllowDeath(contributor.walletAddress, finalAmount);
      const tokenData = txData.tokens.find((t: any) => t.symbol === token.token);

      batchCalls.push(transferCall);

      // Check if the contributor's input data already exists in contributionInputs
      const existingInput = contributionInputs.find(
        (input) =>
          input.fromAddress === accountAddress &&
          input.role.join(',') === contributor.role &&
          input.token.symbol === tokenData.symbol &&
          input.amount === amount.toString()
      );

      if (!existingInput) {
        contributionInputs.push({
          fromAddress: accountAddress,
          role: contributor.role.split(',').map((label: any) => label.trim()),
          token: tokenData,
          amount: amount.toString(),
        });
      }

      contributorOutputs.push({
        token: tokenData,
        amount: amount.toString(),
      });
    }

    const contributorId = contributor.walletAddress.slice(-6);
    const remarkData = {
      Contribution: contribution.name,
      Role: contributor.role.split(',').map((label: any) => label.trim()),
      Labels: contribution.labels.split(',').map((label: any) => label.trim()),
      Date: contribution.date,
      Tokens: contributor.tokens.map((token: any) => ({
        token: token.token,
        amount: token.amount.toString(),
      })),
      ContributorId: contributorId,
    };
    const remarkMessage = JSON.stringify(remarkData);
    const remarkCall = api.tx.system.remark(remarkMessage);

    batchCalls.push(remarkCall);

    // Check if the contributor's output data already exists in contributionOutputs
    const existingOutput = contributionOutputs.find(
      (output) =>
        output.toAddress === contributor.walletAddress &&
        output.role.join(',') === contributor.role &&
        output.tokens.length === contributorOutputs.length &&
        output.tokens.every(
          (token: any, index: any) =>
            token.token.symbol === contributorOutputs[index].token.symbol &&
            token.amount === contributorOutputs[index].amount
        )
    );

    if (!existingOutput) {
      contributionOutputs.push({
        toAddress: contributor.walletAddress,
        tokens: contributorOutputs,
        role: contributor.role.split(',').map((label: any) => label.trim()),
        walletId: null,
        externalWalletId: null,
      });
    }
};