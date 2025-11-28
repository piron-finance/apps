// Stub for blockchain withdraw hook - to be implemented with smart contracts
export function useWithdraw() {
  return {
    withdraw: async () => {
      throw new Error("Withdraw functionality not yet implemented");
    },
    isLoading: false,
    error: null,
  };
}
