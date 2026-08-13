import { createConfig, http, injected } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { Attribution } from "ox/erc8021";

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_2iax4m4l"],
});

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "Base Daily Brief",
      preference: { options: "smartWalletOnly" },
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
  dataSuffix: DATA_SUFFIX,
});
