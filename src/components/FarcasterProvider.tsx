"use client";

import { useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";

export function FarcasterProvider() {
  useEffect(() => {
    sdk.actions.ready();

    // Farcaster cüzdan adresini localStorage'a kaydet
    sdk.context.then(async (ctx) => {
      if (ctx?.user?.fid) {
        try {
          const provider = sdk.wallet.ethProvider;
          const accounts = await provider.request({ method: "eth_accounts" });
          if (accounts?.[0]) {
            localStorage.setItem("connectedWallet", accounts[0].toLowerCase());
          }
        } catch {}
      }
    }).catch(() => {});
  }, []);

  return null;
}
