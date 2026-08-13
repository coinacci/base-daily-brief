import { createConfig, http, injected } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "Base Daily Brief",
      preference: "smartWalletOnly",
    }),
    injected({
      target: "metaMask",
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http("https://base-sepolia.g.alchemy.com/v2/demo"),
  },
});
