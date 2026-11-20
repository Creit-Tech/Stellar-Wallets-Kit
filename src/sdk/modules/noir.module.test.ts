/// <reference lib="deno.ns" />
import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import { Networks } from "../../types/mod.ts";
import { NOIR_ID, NoirModule } from "./noir.module.ts";

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

function makeProvider() {
  const calls: string[] = [];
  return {
    calls,
    isNoir: true as const,
    isConnected: () => Promise.resolve({ isConnected: true }),
    isAllowed: () => Promise.resolve({ isAllowed: true }),
    requestAccess: () => {
      calls.push("requestAccess");
      return Promise.resolve({ address: "GACCESS" });
    },
    getAddress: () => {
      calls.push("getAddress");
      return Promise.resolve({ address: "GADDRESS" });
    },
    getNetwork: () => Promise.resolve({ network: "TESTNET", networkPassphrase: Networks.TESTNET }),
    signTransaction: (xdr: string, opts?: { networkPassphrase?: string; address?: string }) => {
      calls.push(`signTransaction:${xdr}:${opts?.networkPassphrase}:${opts?.address}`);
      return Promise.resolve({ signedTxXdr: "SIGNED", signerAddress: "GSIGNER" });
    },
    signAuthEntry: () => Promise.resolve({ signedAuthEntry: "AUTH_SIG", signerAddress: "GSIGNER" }),
    signMessage: () => Promise.resolve({ signedMessage: "MSG_SIG", signerAddress: "GSIGNER" }),
  };
}

function install(provider?: ReturnType<typeof makeProvider>): void {
  g.window = provider ? { noir: { stellar: provider } } : {};
}

Deno.test("NoirModule exposes its id and is unavailable without the extension", async () => {
  install();
  const module = new NoirModule();
  assertEquals(module.productId, NOIR_ID);
  assertEquals(await module.isAvailable(), false);
  await assertRejects(() => module.getAddress());
  delete g.window;
});

Deno.test("NoirModule requests access unless told to skip it", async () => {
  const provider = makeProvider();
  install(provider);
  const module = new NoirModule();
  assertEquals(await module.isAvailable(), true);
  assertEquals(await module.getAddress(), { address: "GACCESS" });
  assertEquals(await module.getAddress({ skipRequestAccess: true }), { address: "GADDRESS" });
  assertEquals(provider.calls, ["requestAccess", "getAddress"]);
  delete g.window;
});

Deno.test("NoirModule passes SEP-43 options through and maps results", async () => {
  const provider = makeProvider();
  install(provider);
  const module = new NoirModule();
  const tx = await module.signTransaction("XDR", {
    networkPassphrase: Networks.TESTNET,
    address: "GSIGNER",
    path: "x",
  });
  assertEquals(tx, { signedTxXdr: "SIGNED", signerAddress: "GSIGNER" });
  assertEquals(provider.calls.at(-1), `signTransaction:XDR:${Networks.TESTNET}:GSIGNER`);
  assertEquals(await module.signAuthEntry("ENTRY"), { signedAuthEntry: "AUTH_SIG", signerAddress: "GSIGNER" });
  assertEquals(await module.signMessage("hi"), { signedMessage: "MSG_SIG", signerAddress: "GSIGNER" });
  assertEquals(await module.getNetwork(), { network: "TESTNET", networkPassphrase: Networks.TESTNET });
  delete g.window;
});

Deno.test("NoirModule throws the provider's error object", async () => {
  const provider = makeProvider();
  provider.signMessage = () =>
    Promise.resolve({ error: { code: -4, message: "The user rejected this request." } }) as never;
  install(provider);
  const module = new NoirModule();
  const err = await module.signMessage("hi").catch((e) => e);
  assertEquals(err, { code: -4, message: "The user rejected this request.", ext: undefined });
  delete g.window;
});
