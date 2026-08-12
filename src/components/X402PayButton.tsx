"use client";

import { useState } from "react";
import { useConnect, useAccount, useDisconnect, useConnectors, useSwitchChain } from "wagmi";
import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";

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
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [evmAddress, setEvmAddress] = useState<string | null>(null);

  const cbConnector = connectors.find((c) => c.id === "coinbaseWalletSDK");

  async function handleEVMConnect() {
    if (typeof window === "undefined" || !window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    try {
      const accounts = await (window.ethereum as any).request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) setEvmAddress(accounts[0]);
    } catch {
      setError(locale === "tr" ? "Cüzdan bağlantısı reddedildi" : "Wallet connection rejected");
    }
  }

  async function executeX402Payment(walletAddress: string, ethereum: unknown) {
    const apiUrl = `/api/bulletins/${date}?locale=${locale}`;

    // 1. İlk istek — 402 ve payment requirements al
    const firstRes = await fetch(apiUrl);
    if (firstRes.ok) {
      const data = await firstRes.json();
      onSuccess(data);
      return;
    }
    if (firstRes.status !== 402) throw new Error("Beklenmeyen hata");

    const paymentRequired = firstRes.headers.get("payment-required");
    if (!paymentRequired) throw new Error("Ödeme bilgisi alınamadı");

    const paymentInfo = JSON.parse(atob(paymentRequired));
    const accept = paymentInfo.accepts[0];

    // 2. ERC-3009 transferWithAuthorization için imzala
    const client = createWalletClient({
      chain: baseSepolia,
      transport: custom(ethereum as Parameters<typeof custom>[0]),
    });

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
    const nonce = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    const signature = await client.signTypedData({
      account: walletAddress as `0x${string}`,
      domain: {
        name: "USD Coin",
        version: "2",
        chainId: baseSepolia.id,
        verifyingContract: accept.asset as `0x${string}`,
      },
      types: {
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      },
      primaryType: "TransferWithAuthorization",
      message: {
        from: walletAddress as `0x${string}`,
        to: accept.payTo as `0x${string}`,
        value: BigInt(accept.amount),
        validAfter: BigInt(0),
        validBefore: deadline,
        nonce: nonce as `0x${string}`,
      },
    });

    // 3. İmzayı header ile gönder
    const payment = {
      x402Version: 2,
      scheme: accept.scheme,
      network: accept.network,
      payload: {
        signature,
        authorization: {
          from: walletAddress,
          to: accept.payTo,
          value: accept.amount,
          validAfter: "0",
          validBefore: deadline.toString(),
          nonce,
        },
      },
    };

    const secondRes = await fetch(apiUrl, {
      headers: {
        "X-PAYMENT": btoa(JSON.stringify(payment)),
        "Access-Control-Request-Headers": "X-PAYMENT",
      },
    });

    if (secondRes.ok) {
      const data = await secondRes.json();
      onSuccess(data);
    } else {
      throw new Error("Ödeme doğrulanamadı");
    }
  }

  async function handlePay(walletAddr: string, ethereum: unknown) {
    setPaying(true);
    setError("");
    try {
      // Base Sepolia'ya geç
      if (chainId !== baseSepolia.id) {
        try {
          await (ethereum as any).request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x14A34" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await (ethereum as any).request({
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
      }

      await executeX402Payment(walletAddr, ethereum);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ödeme başarısız";
      setError(msg);
    } finally {
      setPaying(false);
    }
  }

  // EVM cüzdan ile ödeme ekranı
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
          onClick={() => handlePay(evmAddress, window.ethereum)}
          disabled={paying}
          style={{ fontFamily: "monospace", fontSize: "12px", border: "1.5px solid #1a1408", padding: "12px 28px", background: paying ? "#c8bfa8" : "#1a1408", color: "#f5f0e8", cursor: paying ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
        >
          {paying ? (locale === "tr" ? "İşleniyor..." : "Processing...") : (locale === "tr" ? "Öde — $0.01 USDC" : "Pay — $0.01 USDC")}
        </button>
        {error && <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "8px" }}>{error}</p>}
      </div>
    );
  }

  // Base Wallet ile ödeme ekranı
  if (isConnected && address) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
          <button
            onClick={() => disconnect()}
            style={{ fontFamily: "monospace", fontSize: "11px", background: "none", border: "0.5px solid #c8bfa8", color: "#7a6f5a", cursor: "pointer", padding: "4px 10px" }}
          >
            {locale === "tr" ? "Bağlantıyı kes" : "Disconnect"}
          </button>
        </div>
        <button
          onClick={() => handlePay(address, window.ethereum)}
          disabled={paying}
          style={{ fontFamily: "monospace", fontSize: "12px", border: "1.5px solid #1a1408", padding: "12px 28px", background: paying ? "#c8bfa8" : "#1a1408", color: "#f5f0e8", cursor: paying ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
        >
          {paying ? (locale === "tr" ? "İşleniyor..." : "Processing...") : (locale === "tr" ? "Öde — $0.01 USDC" : "Pay — $0.01 USDC")}
        </button>
        {error && <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "8px" }}>{error}</p>}
      </div>
    );
  }

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
