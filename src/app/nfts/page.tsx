"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Collection = {
  name: string;
  slug: string;
  imageUrl: string;
  floorPrice: number;
  floorSymbol: string;
  volume1d: number;
  volume7d: number;
  volume30d: number;
  sales1d: number;
  owners: number;
  totalVolume: number;
};

export default function NFTsPage() {
  const { locale } = useLanguage();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selected, setSelected] = useState<Collection | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch("/api/nfts/top");
        const data = await res.json();
        setCollections(data.collections || []);
        if (data.collections?.length > 0) setSelected(data.collections[0]);
      } catch {}
      setLoading(false);
    }
    fetchCollections();
    const interval = setInterval(fetchCollections, 60000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (n: number) => {
    if (n === 0) return "—";
    if (n >= 1) return n.toFixed(3) + " ETH";
    if (n >= 0.001) return n.toFixed(4) + " ETH";
    return n.toFixed(6) + " ETH";
  };

  return (
    <main style={{ background: "var(--surface-2)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ borderTop: "3px solid var(--text-primary)", borderBottom: "1px solid var(--border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", marginBottom: "16px" }}>
          <Link href="/" style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none", letterSpacing: "0.08em" }}>← {locale === "tr" ? "Ana Sayfa" : "Home"}</Link>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>Base Daily Brief</span>
          <LanguageSwitcher />
        </div>

        <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "20px" }}>
          {locale === "tr" ? "Base NFT Koleksiyonları · 24s Hacime Göre · OpenSea" : "Base NFT Collections · By 24h Volume · OpenSea"}
        </div>

        {loading ? (
          <p style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: "24px" }}>

            {/* Sol: Koleksiyon listesi */}
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "10px" }}>
                {locale === "tr" ? "Top 5 Koleksiyon" : "Top 5 Collections"}
              </div>
              {collections.map((col) => (
                <div key={col.slug} onClick={() => setSelected(col)} style={{
                  padding: "12px", marginBottom: "4px", cursor: "pointer",
                  border: selected?.slug === col.slug ? "1px solid var(--text-primary)" : "1px solid var(--border)",
                  background: selected?.slug === col.slug ? "var(--surface-0)" : "transparent",
                  display: "flex", alignItems: "center", gap: "12px"
                }}>
                  {col.imageUrl && <img src={col.imageUrl} alt={col.name} style={{ width: "36px", height: "36px", borderRadius: "4px", objectFit: "cover" }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{col.name}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)" }}>Floor: {fmt(col.floorPrice)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-primary)" }}>{col.volume1d.toFixed(3)} ETH</div>
                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)" }}>24h vol</div>
                  </div>
                </div>
              ))}
              <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", marginTop: "12px" }}>
                {locale === "tr" ? "Veriler OpenSea'dan. Finansal tavsiye değildir." : "Data from OpenSea. Not financial advice."}
              </div>
            </div>

            {/* Sağ: Seçilen koleksiyon detayı */}
            {selected && (
              <div>
                <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px" }}>
                  {selected.name}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ border: "1px solid var(--border)", padding: "12px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Floor Price</div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{fmt(selected.floorPrice)}</div>
                  </div>
                  <div style={{ border: "1px solid var(--border)", padding: "12px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>24h Volume</div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{selected.volume1d.toFixed(3)} ETH</div>
                  </div>
                  <div style={{ border: "1px solid var(--border)", padding: "12px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>24h Sales</div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{selected.sales1d}</div>
                  </div>
                  <div style={{ border: "1px solid var(--border)", padding: "12px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>7d Volume</div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{selected.volume7d.toFixed(3)} ETH</div>
                  </div>
                  <div style={{ border: "1px solid var(--border)", padding: "12px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>30d Volume</div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{selected.volume30d.toFixed(3)} ETH</div>
                  </div>
                  <div style={{ border: "1px solid var(--border)", padding: "12px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Owners</div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{selected.owners.toLocaleString()}</div>
                  </div>
                </div>
                <a href={"https://opensea.io/collection/" + selected.slug} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", fontFamily: "monospace", fontSize: "10px", color: "var(--text-accent)", textDecoration: "none", marginTop: "8px" }}>
                  Open on OpenSea →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
