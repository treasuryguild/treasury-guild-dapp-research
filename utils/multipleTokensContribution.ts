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
  txData: any
) => {
  for (const contributor of contribution.contributors) {
    const contributorOutputs: any[] = [];

    for (const token of contributor.tokens) {
      let amount = token.amount;
      const finalAmount = BigInt(amount) * BigInt(10 ** decimals);
      const transferCall = api.tx.balances.transferAllowDeath(contributor.walletAddress, finalAmount);
      const tokenData = txData.tokens.find((t: any) => t.symbol === token.token);

      batchCalls.push(transferCall);

      contributionInputs.push({
        fromAddress: accountAddress,
        token: tokenData,
        amount: amount.toString()
      });

      contributorOutputs.push({
        token: tokenData,
        amount: amount.toString()
      });
    }

    const contributorId = contributor.walletAddress.slice(-6);
    const remarkData = {
      Contribution: contribution.name,
      Role: contributor.role.split(',').map((label: any) => label.trim()),
      Labels: contribution.labels.split(',').map((label: any) => label.trim()),
      Date: contribution.date,
      Tokens: contributor.tokens.map((token: any) => ({ token: token.token, amount: token.amount.toString() })),
      ContributorId: contributorId,
    };

    const remarkMessage = JSON.stringify(remarkData);
    const remarkCall = api.tx.system.remark(remarkMessage);

    batchCalls.push(remarkCall);

    contributionOutputs.push({
      toAddress: contributor.walletAddress,
      tokens: contributorOutputs,
      role: contributor.role.split(',').map((label: any) => label.trim()),
      walletId: null,
      externalWalletId: null
    });
  }
};