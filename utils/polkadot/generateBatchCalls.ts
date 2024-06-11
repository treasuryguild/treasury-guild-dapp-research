// utils/polkadot/generateBatchCalls.ts
import { ApiPromise } from '@polkadot/api';
import { handleSingleTokenContribution } from './singleTokenContribution';
import { handleMultipleTokensContribution } from './multipleTokensContribution';

interface Contribution {
  name: string;
  labels: string;
  date: string;
  contributors: {
    tokens: {
      token: string;
      amount: string;
    }[];
  }[];
}

export const generateBatchCalls = async (
  contributions: Contribution[],
  api: ApiPromise,
  decimals: number,
  wallet: string,
  txData: any
) => {
  const batchCalls: any[] = [];
  let jsonData: any = {
    transactionHash: '',
    blockNumber: 0,
    fromAddress: wallet,
    toAddress: '',
    project_id: txData.project_id,
    blockchain: 'Polkadot',
    group: txData.group,
    success: false,
    fee: '0',
    contributions: [],
  };

  for (const contribution of contributions) {
    const contributionInputs: any[] = [];
    const contributionOutputs: any[] = [];

    for (const contributor of contribution.contributors) {
      if (contributor.tokens.length === 1) {
        await handleSingleTokenContribution(
          contribution,
          contributionInputs,
          contributionOutputs,
          batchCalls,
          jsonData,
          decimals,
          api,
          wallet,
          txData,
          contributor
        );
      } else {
        await handleMultipleTokensContribution(
          contribution,
          contributionInputs,
          contributionOutputs,
          batchCalls,
          jsonData,
          decimals,
          api,
          wallet,
          txData,
          contributor
        );
      }
    }

    jsonData.contributions.push({
      name: contribution.name,
      labels: contribution.labels.split(',').map(label => label.trim()),
      taskDate: contribution.date,
      inputs: contributionInputs,
      outputs: contributionOutputs,
    });
  }

  return { batchCalls, jsonData };
};