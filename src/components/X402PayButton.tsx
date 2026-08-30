"use client";

import { useState, useEffect } from "react";
import { useConnect, useAccount, useDisconnect, useConnectors, useWalletClient } from "wagmi";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import sdk from "@farcaster/miniapp-sdk";

interface Props {
  payTo: string;
  amount: string;
  date: string;
  locale: string;
  onSuccess: (data: unknown) => void;
  isSubscribe?: boolean;
}

export function X402PayButton({ date, locale, onSuccess, isSubscribe = false }: Props) {
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [isFarcaster, setIsFarcaster] = useState(false);

  const cbConnector = connectors.find((c) => c.id === "coinbaseWalletSDK");

  useEffect(() => {
    sdk.context.then((ctx) => {
      if (ctx?.user?.fid) setIsFarcaster(true);
    }).catch(() => {});
  }, []);

  function getProvider() {
    if (isFarcaster) return sdk.wallet.ethProvider;
    if (typeof window !== "undefined" && window.ethereum) return window.ethereum;
    return null;
  }

  async function switchToBase(provider: any) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }],
      });
    } catch (e: any) {
      if (e.code === 4902) {
        await provider.request({
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

  async function handleEVMConnect() {
    try {
      const provider = getProvider();
      if (!provider) {
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) setEvmAddress(accounts[0]);
    } catch {
      setError(locale === "tr" ? "Cüzdan bağlantısı reddedildi" : "Wallet connection rejected");
    }
  }

  async function payWithEVM(addr: string) {
    setPaying(true);
    setError("");
    try {
      const provider = getProvider();
      if (!provider) throw new Error("No provider");

      await switchToBase(provider);

      const wallet = createWalletClient({
        account: addr as `0x${string}`,
        chain: base,
        transport: custom(provider as any),
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

      const endpoint = isSubscribe ? "/api/subscribe" : `/api/bulletins/${date}?locale=${locale}`;
      const res = await fetchWithPay(endpoint, {
        method: isSubscribe ? "POST" : "GET",
        headers: isSubscribe ? {} : { "x-wallet-address": addr },
      });

      if (res.ok) {
        const data = await res.json();
        if (isSubscribe && data?.apiKey) {
          // Cüzdan adresini apiKey ile otomatik ilişkilendir
          await fetch("/api/subscribe/link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: data.apiKey, walletAddress: addr }),
          }).catch(() => {});
        } else {
          localStorage.setItem(`paid:${addr.toLowerCase()}:${date}`, "1");
        }
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

      const endpoint = isSubscribe ? "/api/subscribe" : `/api/bulletins/${date}?locale=${locale}`;
      const res = await fetchWithPay(endpoint, {
        method: isSubscribe ? "POST" : "GET",
        headers: isSubscribe ? {} : { "x-wallet-address": address },
      });

      if (res.ok) {
        const data = await res.json();
        if (isSubscribe && data?.apiKey) {
          await fetch("/api/subscribe/link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: data.apiKey, walletAddress: address }),
          }).catch(() => {});
        } else {
          localStorage.setItem(`paid:${address.toLowerCase()}:${date}`, "1");
        }
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

  if (evmAddress) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
            {`${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`}
          </span>
          <button onClick={() => setEvmAddress(null)} style={{ fontFamily: "monospace", fontSize: "11px", background: "none", border: "0.5px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", padding: "4px 10px" }}>
            {locale === "tr" ? "Bağlantıyı kes" : "Disconnect"}
          </button>
        </div>
        <button
          onClick={() => payWithEVM(evmAddress)}
          disabled={paying}
          style={{ fontFamily: "monospace", fontSize: "12px", border: "1.5px solid var(--text-primary)", padding: "12px 28px", background: paying ? "var(--border)" : "var(--text-primary)", color: "var(--surface-2)", cursor: paying ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
        >
          {paying ? (locale === "tr" ? "İşleniyor..." : "Processing...") : isSubscribe ? (locale === "tr" ? "Abone Ol — $0.25 USDC" : "Subscribe — $0.25 USDC") : (locale === "tr" ? "Öde — $0.01 USDC" : "Pay — $0.01 USDC")}
        </button>
        {error && <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "8px" }}>{error}</p>}
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
          <button onClick={() => disconnect()} style={{ fontFamily: "monospace", fontSize: "11px", background: "none", border: "0.5px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", padding: "4px 10px" }}>
            {locale === "tr" ? "Bağlantıyı kes" : "Disconnect"}
          </button>
        </div>
        <button
          onClick={payWithWagmi}
          disabled={paying}
          style={{ fontFamily: "monospace", fontSize: "12px", border: "1.5px solid var(--text-primary)", padding: "12px 28px", background: paying ? "var(--border)" : "var(--text-primary)", color: "var(--surface-2)", cursor: paying ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
        >
          {paying ? (locale === "tr" ? "İşleniyor..." : "Processing...") : isSubscribe ? (locale === "tr" ? "Abone Ol — $0.25 USDC" : "Subscribe — $0.25 USDC") : (locale === "tr" ? "Öde — $0.01 USDC" : "Pay — $0.01 USDC")}
        </button>
        {error && <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "8px" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "20px", letterSpacing: "0.05em" }}>
        {locale === "tr" ? "Cüzdanını bağla ve ödeme yap" : "Connect your wallet to pay"}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        {!isFarcaster && cbConnector && (
          <button
            onClick={() => connect({ connector: cbConnector })}
            style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid var(--text-primary)", padding: "12px 24px", background: "var(--text-primary)", color: "var(--surface-2)", cursor: "pointer", letterSpacing: "0.06em", width: "240px" }}
          >
            Base Wallet
          </button>
        )}
        <button
          onClick={handleEVMConnect}
          style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid var(--border)", padding: "12px 24px", background: "var(--surface-2)", color: "var(--text-primary)", cursor: "pointer", letterSpacing: "0.06em", width: "240px" }}
        >
          {isFarcaster ? "Connect Farcaster Wallet" : "EVM Wallet"}
        </button>
      </div>
      {!isFarcaster && (
        <p style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)", marginTop: "14px" }}>
          {locale === "tr" ? "MetaMask, Rainbow, Rabby ve diğer EVM cüzdanları desteklenir" : "MetaMask, Rainbow, Rabby and other EVM wallets supported"}
        </p>
      )}
    </div>
  );
}
