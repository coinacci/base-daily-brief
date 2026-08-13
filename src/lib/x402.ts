import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { createFacilitatorConfig } from "@coinbase/x402";

const PAY_TO = process.env.X402_PAY_TO ?? "0x33661B8496075c3b8b2B69CB3E03BC3436808d78";
const PRICE = process.env.X402_PRICE ?? "0.01";
const NETWORK = (process.env.X402_NETWORK ?? "eip155:8453") as `${string}:${string}`;
const BUILDER_CODE = "bc_2iax4m4l";

function createFacilitator() {
  const keyId = process.env.CDP_API_KEY_ID;
  const keySecret = process.env.CDP_API_KEY_SECRET;

  if (keyId && keySecret) {
    const config = createFacilitatorConfig(keyId, keySecret);
    return new HTTPFacilitatorClient(config);
  }

  return new HTTPFacilitatorClient({
    url: "https://x402.org/facilitator",
  });
}

export function createX402Server() {
  const facilitator = createFacilitator();
  const server = new x402ResourceServer(facilitator);
  server.register(NETWORK, new ExactEvmScheme());
  return server;
}

export const x402Config = {
  payTo: PAY_TO,
  price: `$${PRICE}` as const,
  network: NETWORK,
  builderCode: BUILDER_CODE,
};
