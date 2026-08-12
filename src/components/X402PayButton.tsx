"use client";

import { useState } from "react";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { createWalletClient, custom, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface Props {
  payTo: string;
  amount: string;
  date: string;
  locale: string;
  onSuccess: () => void;
}

export function X402PayButton({ payTo, locale, onSuccess }: Props) {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const cbConnector = connectors.find((c) => c.id === "coinbaseWalletSDK");
  const injectedConnector = connectors.find((c) => c.id === "injected");

  async function handlePay() {
    if (!address) return;
    if (typeof window === "undefined" || !window.ethereum) {
      setError(locale === "tr" ? "Tarayıcı cüzdanı bulunamadı" : "No browser wallet found");
      return;
    }
    setPaying(true);
    setError("");
    try {
      const client = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum as Parameters<typeof custom>[0]),
      });

      const usdcAmount = parseUnits("0.01", 6);

      await client.writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [payTo as `0x${string}`, usdcAmount],
        account: address as `0x${string}`,
      });

      onSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ödeme başarısız";
      setError(msg);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      {!isConnected ? (
        <div>
          <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", marginBottom: "16px", letterSpacing: "0.05em" }}>
            {locale === "tr" ? "Cüzdanını bağla ve ödeme yap" : "Connect your wallet to pay"}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {cbConnector && (
              <button
                onClick={() => connect({ connector: cbConnector })}
                style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid #1a1408", padding: "10px 20px", background: "#1a1408", color: "#f5f0e8", cursor: "pointer", letterSpacing: "0.06em" }}
              >
                Base Wallet
              </button>
            )}
            {injectedConnector && (
              <button
                onClick={() => connect({ connector: injectedConnector })}
                style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid #c8a84a", padding: "10px 20px", background: "#f0e4c0", color: "#8b6914", cursor: "pointer", letterSpacing: "0.06em" }}
              >
                {locale === "tr" ? "Tarayıcı Cüzdanı" : "Browser Wallet"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#7a6f5a", marginBottom: "12px" }}>
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
            <button onClick={() => disconnect()} style={{ marginLeft: "8px", background: "none", border: "none", color: "#c8bfa8", cursor: "pointer", fontSize: "10px" }}>
              ✕
            </button>
          </p>
          <button
            onClick={handlePay}
            disabled={paying}
            style={{ fontFamily: "monospace", fontSize: "12px", border: "1.5px solid #1a1408", padding: "12px 28px", background: paying ? "#c8bfa8" : "#1a1408", color: "#f5f0e8", cursor: paying ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
          >
            {paying
              ? (locale === "tr" ? "İşleniyor..." : "Processing...")
              : (locale === "tr" ? "Öde — $0.01 USDC" : "Pay — $0.01 USDC")}
          </button>
          {error && (
            <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "8px" }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
