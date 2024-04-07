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

    contributionInputs.push({
      fromAddress: accountAddress,
      tokens: [
        {
          token: tokenData,
          amount: amount.toString()
        }
      ],
    });

    contributionOutputs.push({
      toAddress: contributor.walletAddress,
      tokens: [
        {
          token: tokenData,
          amount: amount.toString()
        }
      ],
      role: contributor.role.split(',').map((label: any) => label.trim()),
      walletId: null,
      externalWalletId: null
    });
  }
};