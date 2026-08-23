"use client";

import { useEffect, useState } from "react";

type Stock = {
  symbol: string;
  name: string;
  priceUsd: number;
  priceChange: { h24: number };
  volume: { h24: number };
};

export function StocksTicker() {
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    fetch("/api/stocks")
      .then((r) => r.json())
      .then((data) => setStocks(data.stocks || []));
  }, []);

  if (!stocks.length) return null;

  const items = [...stocks, ...stocks]; // sonsuz döngü için çift

  return (
    <div style={{
      background: "#1a1408",
      borderTop: "1px solid #c8bfa8",
      borderBottom: "1px solid #c8bfa8",
      overflow: "hidden",
      padding: "5px 0",
      position: "relative",
    }}>
      <div style={{
        display: "flex",
        gap: 0,
        animation: "ticker 30s linear infinite",
        whiteSpace: "nowrap",
      }}>
        {items.map((stock, i) => (
          <div key={i} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 28px",
            borderRight: "1px solid #3a3020",
          }}>
            <span style={{
              fontFamily: "monospace",
              fontSize: "11px",
              fontWeight: 700,
              color: "#f5f0e8",
              letterSpacing: "0.05em",
            }}>
              {stock.symbol}
            </span>
            <span style={{
              fontFamily: "monospace",
              fontSize: "11px",
              color: "#c8bfa8",
            }}>
              ${stock.priceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{
              fontFamily: "monospace",
              fontSize: "11px",
              fontWeight: 700,
              color: stock.priceChange.h24 >= 0 ? "#4ade80" : "#f87171",
            }}>
              {stock.priceChange.h24 >= 0 ? "+" : ""}{stock.priceChange.h24.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
