"use client";

import { useState, useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { useConnect, useAccount, useDisconnect, useConnectors, useWalletClient } from "wagmi";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";

interface Props {
  payTo: string;
  amount: string;
  date: string;
  locale: string;
  onSuccess: (data: unknown) => void;
}

export function X402PayButton({ date, locale, onSuccess }: Props) {
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [isFarcaster, setIsFarcaster] = useState(false);

  useEffect(() => {
    sdk.context.then((ctx) => {
      if (ctx?.user?.fid) setIsFarcaster(true);
    }).catch(() => {});
  }, []);

  const cbConnector = connectors.find((c) => c.id === "coinbaseWalletSDK");

  async function handleEVMConnect() {
    try {
      if (isFarcaster) {
        const provider = sdk.wallet.ethProvider;
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        if (accounts?.[0]) setEvmAddress(accounts[0]);
      } else if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await (window.ethereum as any).request({ method: "eth_requestAccounts" });
        if (accounts?.[0]) setEvmAddress(accounts[0]);
      } else {
        window.open("https://metamask.io/download/", "_blank");
      }
    } catch {
      setError(locale === "tr" ? "Cüzdan bağlantısı reddedildi" : "Wallet connection rejected");
    }
  }

  async function switchToBase(ethereum: any) {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }],
      });
    } catch (e: any) {
      if (e.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x2105",
            chainName: "Base",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          }],
        });
      }
    }
  }

  // Base Wallet (wagmi walletClient) ile ödeme
  async function payWithWagmi() {
    if (!walletClient || !address) return;
    setPaying(true);
    setError("");
    try {
      const signer = {
        address,
        signTypedData: async (params: any) =>
          walletClient.signTypedData({
            account: walletClient.account!,
            domain: params.domain,
            types: params.types,
            primaryType: params.primaryType,
            message: params.message,
          }),
      };

      const client = new x402Client();
      registerExactEvmScheme(client, { signer });
      const fetchWithPay = wrapFetchWithPayment(fetch, client);

      const res = await fetchWithPay(`/api/bulletins/${date}?locale=${locale}`, {
        headers: { "x-wallet-address": address },
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`paid:${address.toLowerCase()}:${date}`, "1");
        onSuccess(data);
      } else {
        throw new Error(locale === "tr" ? "Ödeme sonrası içerik alınamadı" : "Failed to load content after payment");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ödeme başarısız";
      setError(msg);
    } finally {
      setPaying(false);
    }
  }

  // EVM Wallet (window.ethereum) ile ödeme
  async function payWithEVM(addr: string) {
    setPaying(true);
    setError("");
    try {
      await switchToBase(window.ethereum);

      const ethereum = isFarcaster ? sdk.wallet.ethProvider : window.ethereum;
      const wallet = createWalletClient({
        account: addr as `0x${string}`,
        chain: base,
        transport: custom(ethereum as any),
      });

      const signer = {
        address: addr as `0x${string}`,
        signTypedData: async (params: any) =>
          wallet.signTypedData({
            account: addr as `0x${string}`,
            domain: params.domain,
            types: params.types,
            primaryType: params.primaryType,
            message: params.message,
          }),
      };

      const client = new x402Client();
      registerExactEvmScheme(client, { signer });
      const fetchWithPay = wrapFetchWithPayment(fetch, client);

      const res = await fetchWithPay(`/api/bulletins/${date}?locale=${locale}`, {
        headers: { "x-wallet-address": addr },
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`paid:${addr.toLowerCase()}:${date}`, "1");
        onSuccess(data);
      } else {
        throw new Error(locale === "tr" ? "Ödeme sonrası içerik alınamadı" : "Failed to load content after payment");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ödeme başarısız";
      setError(msg);
    } finally {
      setPaying(false);
    }
  }

  // EVM cüzdan bağlı
  if (evmAddress) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>
            {`${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`}
          </span>
          <button onClick={() => setEvmAddress(null)} style={{ fontFamily: "monospace", fontSize: "11px", background: "none", border: "0.5px solid #c8bfa8", color: "#7a6f5a", cursor: "pointer", padding: "4px 10px" }}>
            {locale === "tr" ? "Bağlantıyı kes" : "Disconnect"}
          </button>
        </div>
        <button
          onClick={() => payWithEVM(evmAddress)}
          disabled={paying}
          style={{ fontFamily: "monospace", fontSize: "12px", border: "1.5px solid #1a1408", padding: "12px 28px", background: paying ? "#c8bfa8" : "#1a1408", color: "#f5f0e8", cursor: paying ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
        >
          {paying ? (locale === "tr" ? "İşleniyor..." : "Processing...") : (locale === "tr" ? "Öde — $0.01 USDC" : "Pay — $0.01 USDC")}
        </button>
        {error && <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "8px" }}>{error}</p>}
      </div>
    );
  }

  // Base Wallet bağlı
  if (isConnected && address) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
          <button onClick={() => disconnect()} style={{ fontFamily: "monospace", fontSize: "11px", background: "none", border: "0.5px solid #c8bfa8", color: "#7a6f5a", cursor: "pointer", padding: "4px 10px" }}>
            {locale === "tr" ? "Bağlantıyı kes" : "Disconnect"}
          </button>
        </div>
        <button
          onClick={payWithWagmi}
          disabled={paying}
          style={{ fontFamily: "monospace", fontSize: "12px", border: "1.5px solid #1a1408", padding: "12px 28px", background: paying ? "#c8bfa8" : "#1a1408", color: "#f5f0e8", cursor: paying ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
        >
          {paying ? (locale === "tr" ? "İşleniyor..." : "Processing...") : (locale === "tr" ? "Öde — $0.01 USDC" : "Pay — $0.01 USDC")}
        </button>
        {error && <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "8px" }}>{error}</p>}
      </div>
    );
  }

  // Cüzdan seçim ekranı
  return (
    <div style={{ textAlign: "center" }}>
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
        {locale === "tr" ? "MetaMask, Rainbow, Rabby ve diğer EVM cüzdanları desteklenir" : "MetaMask, Rainbow, Rabby and other EVM wallets supported"}
      </p>
    </div>
  );
}
