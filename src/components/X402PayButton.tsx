"use client";

import { useState, useEffect } from "react";
import { useConnect, useAccount, useDisconnect, useConnectors, useSwitchChain } from "wagmi";
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
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [evmAddress, setEvmAddress] = useState<string | null>(null);

  const cbConnector = connectors.find((c) => c.id === "coinbaseWalletSDK");

  // window.ethereum ile direkt bağlan
  async function handleEVMConnect() {
    if (typeof window === "undefined" || !window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    try {
      const accounts = await (window.ethereum as any).request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        setEvmAddress(accounts[0]);
      }
    } catch (e) {
      setError(locale === "tr" ? "Cüzdan bağlantısı reddedildi" : "Wallet connection rejected");
    }
  }

  async function handleEVMPay() {
    if (!evmAddress || !window.ethereum) return;
    setPaying(true);
    setError("");
    try {
      // Önce Base Sepolia'ya geç
      try {
        await (window.ethereum as any).request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x14A34" }], // 84532 hex
        });
      } catch (switchError: any) {
        // Ağ eklenmemişse ekle
        if (switchError.code === 4902) {
          await (window.ethereum as any).request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x14A34",
              chainName: "Base Sepolia",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://base-sepolia.g.alchemy.com/v2/demo"],
              blockExplorerUrls: ["https://sepolia.basescan.org"],
            }],
          });
        }
      }

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
        account: evmAddress as `0x${string}`,
      });
      onSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ödeme başarısız";
      setError(msg);
    } finally {
      setPaying(false);
    }
  }

  async function handlePay() {
    if (!address) return;
    if (typeof window === "undefined" || !window.ethereum) {
      setError(locale === "tr" ? "Tarayıcı cüzdanı bulunamadı" : "No browser wallet found");
      return;
    }
    setPaying(true);
    setError("");
    try {
      if (chainId !== baseSepolia.id) {
        await switchChainAsync({ chainId: baseSepolia.id });
      }
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

  // EVM cüzdan bağlıysa ödeme ekranı göster
  if (evmAddress) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>
            {`${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`}
          </span>
          <button
            onClick={() => setEvmAddress(null)}
            style={{ fontFamily: "monospace", fontSize: "11px", background: "none", border: "0.5px solid #c8bfa8", color: "#7a6f5a", cursor: "pointer", padding: "4px 10px" }}
          >
            {locale === "tr" ? "Bağlantıyı kes" : "Disconnect"}
          </button>
        </div>
        <button
          onClick={handleEVMPay}
          disabled={paying}
          style={{ fontFamily: "monospace", fontSize: "12px", border: "1.5px solid #1a1408", padding: "12px 28px", background: paying ? "#c8bfa8" : "#1a1408", color: "#f5f0e8", cursor: paying ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
        >
          {paying
            ? (locale === "tr" ? "İşleniyor..." : "Processing...")
            : (locale === "tr" ? "Öde — $0.01 USDC" : "Pay — $0.01 USDC")}
        </button>
        {error && (
          <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "8px" }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      {!isConnected ? (
        <div>
          <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", marginBottom: "20px", letterSpacing: "0.05em" }}>
            {locale === "tr" ? "Cüzdanını bağla ve ödeme yap" : "Connect your wallet to pay"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
            {cbConnector && (
              <button
                onClick={() => connect({ connector: cbConnector })}
                style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid #1a1408", padding: "12px 24px", background: "#1a1408", color: "#f5f0e8", cursor: "pointer", letterSpacing: "0.06em", width: "240px" }}
              >
                Base Wallet
              </button>
            )}
            <button
              onClick={handleEVMConnect}
              style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid #c8bfa8", padding: "12px 24px", background: "#f5f0e8", color: "#2a2010", cursor: "pointer", letterSpacing: "0.06em", width: "240px" }}
            >
              EVM Wallet
            </button>
          </div>
          <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c8bfa8", marginTop: "14px" }}>
            {locale === "tr"
              ? "MetaMask, Rainbow, Rabby ve diğer EVM cüzdanları desteklenir"
              : "MetaMask, Rainbow, Rabby and other EVM wallets supported"}
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
            </span>
            {chainId !== baseSepolia.id && (
              <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", background: "#fdf0ed", border: "0.5px solid #e74c3c", padding: "2px 8px" }}>
                {locale === "tr" ? "Yanlış ağ" : "Wrong network"}
              </span>
            )}
            <button
              onClick={() => disconnect()}
              style={{ fontFamily: "monospace", fontSize: "11px", background: "none", border: "0.5px solid #c8bfa8", color: "#7a6f5a", cursor: "pointer", padding: "4px 10px" }}
            >
              {locale === "tr" ? "Bağlantıyı kes" : "Disconnect"}
            </button>
          </div>
          <button
            onClick={handlePay}
            disabled={paying}
            style={{ fontFamily: "monospace", fontSize: "12px", border: "1.5px solid #1a1408", padding: "12px 28px", background: paying ? "#c8bfa8" : "#1a1408", color: "#f5f0e8", cursor: paying ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
          >
            {paying
              ? (locale === "tr" ? "İşleniyor..." : "Processing...")
              : chainId !== baseSepolia.id
              ? (locale === "tr" ? "Base Sepolia'ya geç ve öde" : "Switch to Base Sepolia & pay")
              : (locale === "tr" ? "Öde — $0.01 USDC" : "Pay — $0.01 USDC")}
          </button>
          {error && (
            <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "8px" }}>{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
