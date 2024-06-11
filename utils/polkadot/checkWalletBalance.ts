// utils/polkadot/checkWalletBalance.ts
export const checkWalletBalance = async (token: { token: string }, requiredAmount: number, tokenData: any) => {
    const tokenInfo = tokenData.find((t: any) => t.symbol === token.token);
  
    if (tokenInfo) {
      const { balance, decimals } = tokenInfo as { symbol: string; balance: string; decimals: number };
      const availableBalance = Number(balance) / Math.pow(10, decimals);
      console.log(`Available balance for token ${tokenInfo.symbol}:`, availableBalance);
  
      if (availableBalance < requiredAmount) {
        alert(`Insufficient balance for token ${tokenInfo.symbol}. Required: ${Number(requiredAmount)}, Available: ${availableBalance}`);
        const errorMessage = `Insufficient balance for token ${tokenInfo.symbol}. Required: ${Number(requiredAmount)}, Available: ${availableBalance}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } else {
      console.warn(`Token data not found for symbol: ${token.token}`);
    }
  };