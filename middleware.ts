import { paymentMiddleware } from "x402-next";

export default paymentMiddleware(
  "0x33661B8496075c3b8b2B69CB3E03BC3436808d78",
  {
    "/bulletin/:date": {
      price: "$0.01",
      network: "base-sepolia",
      config: {
        description: "Base Daily Brief — Günlük bülten erişimi",
      },
    },
  },
  {
    url: "https://x402.org/facilitator",
  }
);

export const config = {
  matcher: ["/bulletin/:path*"],
};
