import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet, metaMask } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "Base Daily Brief",
      preference: "smartWalletOnly",
    }),
    metaMask(),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});
