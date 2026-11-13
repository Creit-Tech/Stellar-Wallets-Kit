/// <reference lib="deno.ns" />
import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import { LockerModule } from "./locker.module.ts";

/**
 * Locker Wallet's extension defines `window.lockerStellar`, a SEP-43 provider marked `isLocker: true`, before the
 * page's scripts run. These tests install a scripted provider as the global `window` and check what the module asks
 * of it and what it hands back to the kit.
 */

// deno-lint-ignore no-explicit-any
type Any = any;
// deno-lint-ignore no-explicit-any
const g = globalThis as any;

const ADDRESS = "GCRN5PMAG5FM5QLCH7BUZPRQ7UIW37LBZLF2BIDEOSG4ZQ6HYRC45ALA";
const PUBNET = "Public Global Stellar Network ; September 2015";

function makeProvider(over: Record<string, unknown> = {}) {
  const calls: Any[] = [];
  const provider: Any = {
    isLocker: true,
    getAddress: () => Promise.resolve({ address: ADDRESS }),
    getNetwork: () => Promise.resolve({ network: "PUBLIC", networkPassphrase: PUBNET }),
    signTransaction: (xdr: string, opts: unknown) => {
      calls.push(["signTransaction", xdr, opts]);
      return Promise.resolve({ signedTxXdr: "SIGNED_TX", signerAddress: ADDRESS });
    },
    signAuthEntry: (entry: string, opts: unknown) => {
      calls.push(["signAuthEntry", entry, opts]);
      return Promise.resolve({ signedAuthEntry: "SIGNED_ENTRY", signerAddress: ADDRESS });
    },
    signMessage: (message: string, opts: unknown) => {
      calls.push(["signMessage", message, opts]);
      return Promise.resolve({ signedMessage: "SIGNED_MESSAGE", signerAddress: ADDRESS });
    },
    ...over,
  };
  return { provider, calls };
}

function install(provider?: Any): void {
  g.window = provider ? { lockerStellar: provider } : {};
}

function clearWindow(): void {
  delete g.window;
}

Deno.test("isAvailable(): true when window.lockerStellar is Locker Wallet's provider", async () => {
  install(makeProvider().provider);
  try {
    assertEquals(await new LockerModule().isAvailable(), true);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): false with no window, no provider, or a provider that is not Locker Wallet's", async () => {
  assertEquals(await new LockerModule().isAvailable(), false);
  install();
  try {
    assertEquals(await new LockerModule().isAvailable(), false);
    install({ ...makeProvider().provider, isLocker: undefined });
    assertEquals(await new LockerModule().isAvailable(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("getAddress(): the provider's address", async () => {
  install(makeProvider().provider);
  try {
    assertEquals(await new LockerModule().getAddress(), { address: ADDRESS });
  } finally {
    clearWindow();
  }
});

Deno.test("getAddress(): rejects with code -3 when Locker Wallet is not installed", async () => {
  install();
  try {
    const e: Any = await assertRejects(() => new LockerModule().getAddress());
    assertEquals(e.code, -3);
  } finally {
    clearWindow();
  }
});

Deno.test("signTransaction(): passes the XDR, the passphrase and the address, returns the signed XDR", async () => {
  const { provider, calls } = makeProvider();
  install(provider);
  try {
    const out = await new LockerModule().signTransaction("TX_XDR", {
      networkPassphrase: PUBNET,
      address: ADDRESS,
      path: "ignored",
    });
    assertEquals(out, { signedTxXdr: "SIGNED_TX", signerAddress: ADDRESS });
    assertEquals(calls, [["signTransaction", "TX_XDR", { networkPassphrase: PUBNET, address: ADDRESS }]]);
  } finally {
    clearWindow();
  }
});

Deno.test("signTransaction(): a refusal on the Vault keeps the provider's code and message", async () => {
  const refused = { code: 4001, message: "User rejected the request." };
  install(makeProvider({ signTransaction: () => Promise.reject(refused) }).provider);
  try {
    const e: Any = await assertRejects(() => new LockerModule().signTransaction("TX_XDR"));
    assertEquals([e.code, e.message], [4001, "User rejected the request."]);
  } finally {
    clearWindow();
  }
});

Deno.test("signTransaction(): an empty answer is an error, never an empty signature", async () => {
  install(makeProvider({ signTransaction: () => Promise.resolve({ signedTxXdr: "" }) }).provider);
  try {
    const e: Any = await assertRejects(() => new LockerModule().signTransaction("TX_XDR"));
    assertEquals(e.code, -3);
  } finally {
    clearWindow();
  }
});

Deno.test("signAuthEntry() and signMessage(): the SEP-43 results, only the options Locker Wallet reads", async () => {
  const { provider, calls } = makeProvider();
  install(provider);
  try {
    const m = new LockerModule();
    assertEquals(await m.signAuthEntry("ENTRY", { networkPassphrase: PUBNET }), {
      signedAuthEntry: "SIGNED_ENTRY",
      signerAddress: ADDRESS,
    });
    assertEquals(await m.signMessage("hello", { address: ADDRESS }), {
      signedMessage: "SIGNED_MESSAGE",
      signerAddress: ADDRESS,
    });
    assertEquals(calls, [
      ["signAuthEntry", "ENTRY", { networkPassphrase: PUBNET }],
      ["signMessage", "hello", { address: ADDRESS }],
    ]);
  } finally {
    clearWindow();
  }
});

Deno.test("getNetwork(): the provider's network and passphrase", async () => {
  install(makeProvider().provider);
  try {
    assertEquals(await new LockerModule().getNetwork(), { network: "PUBLIC", networkPassphrase: PUBNET });
  } finally {
    clearWindow();
  }
});
