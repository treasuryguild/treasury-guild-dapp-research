// utils/transformContributionsMetadata.ts

interface Token {
  symbol: string;
  amount: string;
  balance: string;
  name: string;
  decimals: number;
  contractAddress: string;
}

interface Input {
  fromAddress: string;
  tokens: { amount: string; token: Token }[];
}

interface Output {
  toAddress: string;
  tokens: { amount: string; token: Token }[];
}

interface Contribution {
  inputs: Input[];
  outputs: Output[];
  name: string;
  labels: string[];
  sub_group: string[];
  taskDate: string;
}

interface Metadata {
  msg: string[];
  txid: string;
  mdVersion: string[];
  contributions: {
    name: string[];
    arrayMap: {
      date: string[];
      label: string[];
      subGroup: string[];
    };
    taskCreator: string;
    contributors: {
      [key: string]: {
        [key: string]: string;
      };
    };
  }[];
}

export function transformContributionsToMetadata(contributions: Contribution[], transactionHash: string): Metadata {
  const recipients = contributions.reduce((total, contribution) => 
    total + contribution.outputs.length, 0);

  const tokenSums: { [key: string]: number } = {};
  contributions.forEach(contribution => {
    contribution.outputs.forEach(output => {
      output.tokens.forEach(token => {
        const symbol = token.token.symbol;
        tokenSums[symbol] = (tokenSums[symbol] || 0) + parseFloat(token.amount);
      });
    });
  });

  const tokenMessages = Object.entries(tokenSums).map(([token, amount]) => 
    `0 USD in ${amount} ${token}`);

  const metadata: Metadata = {
    msg: [
      "Treasury Guild Bulk Transaction",
      `Recipients: ${recipients}`,
      ...tokenMessages,
      "Transaction made by Treasury Guild ;-)",
      "https://www.treasuryguild.io/"
    ],
    txid: transactionHash,
    mdVersion: ["1.8"],
    contributions: contributions.map(contribution => ({
      name: [contribution.name],
      arrayMap: {
        date: [contribution.taskDate],
        label: contribution.labels,
        subGroup: contribution.sub_group
      },
      taskCreator: "Treasury Guild",
      contributors: contribution.outputs.reduce((acc, output) => {
        const contributorId = output.toAddress.slice(-6);
        acc[contributorId] = output.tokens.reduce((tokenAcc, token) => {
          tokenAcc[token.token.symbol] = token.amount;
          return tokenAcc;
        }, {} as { [key: string]: string });
        return acc;
      }, {} as { [key: string]: { [key: string]: string } })
    }))
  };

  return metadata;
}