/// <reference lib="deno.ns" />
import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import { Networks } from "../../types/mod.ts";
import { VeilModule, type VeilProvider } from "./veil.module.ts";

/**
 * Veil is a passkey-powered wallet. Inside Veil's in-app dApp browser,
 * the module detects window.veil. Outside, it communicates with the
 * web wallet popup over postMessage.
 */

// deno-lint-ignore no-explicit-any
type Any = any;

function makeWindowPair() {
  const listeners = new Set<(e: Any) => void>();
  const received: Any[] = [];
  const popup: Any = {
    closed: false,
    close() {
      this.closed = true;
    },
    focus() {},
    postMessage(data: unknown) {
      received.push(data);
    },
  };
  const dapp: Any = {
    opened: 0,
    outerWidth: 1440,
    outerHeight: 900,
    screenX: 0,
    screenY: 0,
    screen: { width: 1440, height: 900 },
    addEventListener(t: string, fn: (e: Any) => void) {
      if (t === "message") listeners.add(fn);
    },
    removeEventListener(_t: string, fn: (e: Any) => void) {
      listeners.delete(fn);
    },
    open() {
      dapp.opened += 1;
      popup.closed = false;
      return popup;
    },
  };
  const page = {
    received,
    last: () => received[received.length - 1],
    post(data: unknown) {
      for (const fn of [...listeners]) fn({ origin: "https://wallet.useveilapp.xyz", source: popup, data });
    },
    ready() {
      this.post({ veil: 1, type: "ready" });
    },
    reply(id: string, result: unknown) {
      this.post({ veil: 1, id, type: "result", result });
    },
    fail(id: string, error: { code: number; message: string }) {
      this.post({ veil: 1, id, type: "error", error });
    },
  };
  globalThis.window = dapp;
  return { dapp, page, popup };
}

const ACCOUNT = { address: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" };
const SIGNED = { ...ACCOUNT, hash: "CAFE", blob: "AAAAAgAA", signature: "ff".repeat(64) };

Deno.test("metadata: a hot wallet, always available, with its icon", async () => {
  makeWindowPair();
  const mod = new VeilModule();
  assertEquals(mod.productId, "veil");
  assertEquals(mod.productName, "Veil");
  assertEquals(mod.productUrl, "https://useveilapp.xyz");
  assertEquals(mod.productIcon.startsWith("data:image/svg+xml;base64,"), true);
  assertEquals(await mod.isAvailable(), true);
  assertEquals(await mod.isPlatformWrapper(), false);
});

Deno.test("injected provider: detects window.veil and uses it without opening popup", async () => {
  const { dapp } = makeWindowPair();
  let injectedCalled = false;

  const mockProvider: VeilProvider = {
    getAddress: () => {
      injectedCalled = true;
      return Promise.resolve({ address: ACCOUNT.address });
    },
    signTransaction: (_xdr, _opts) => {
      return Promise.resolve({ signedTxXdr: SIGNED.blob, signerAddress: ACCOUNT.address });
    },
    signAuthEntry: (_auth, _opts) => {
      return Promise.resolve({ signedAuthEntry: "c2ln", signerAddress: ACCOUNT.address });
    },
    signMessage: (_msg, _opts) => {
      return Promise.resolve({ signedMessage: "bXNn", signerAddress: ACCOUNT.address });
    },
    signAndSubmitTransaction: (_xdr, _opts) => {
      return Promise.resolve({ status: "success" });
    },
    getNetwork: () => {
      return Promise.resolve({ network: "TESTNET", networkPassphrase: Networks.TESTNET });
    },
  };

  (globalThis.window as Any).veil = mockProvider;

  const mod = new VeilModule();
  assertEquals(await mod.isAvailable(), true);
  assertEquals(await mod.isPlatformWrapper(), true);

  const addr = await mod.getAddress();
  assertEquals(addr, { address: ACCOUNT.address });
  assertEquals(injectedCalled, true);
  assertEquals(dapp.opened, 0, "no popup should be opened when window.veil is present");

  const txRes = await mod.signTransaction("AAAA", { networkPassphrase: Networks.TESTNET });
  assertEquals(txRes, { signedTxXdr: SIGNED.blob, signerAddress: ACCOUNT.address });

  const authRes = await mod.signAuthEntry("AAAACQ");
  assertEquals(authRes, { signedAuthEntry: "c2ln", signerAddress: ACCOUNT.address });

  const msgRes = await mod.signMessage("hello");
  assertEquals(msgRes, { signedMessage: "bXNn", signerAddress: ACCOUNT.address });

  const submitRes = await mod.signAndSubmitTransaction("AAAA");
  assertEquals(submitRes, { status: "success" });

  const netRes = await mod.getNetwork();
  assertEquals(netRes, { network: "TESTNET", networkPassphrase: Networks.TESTNET });
});

Deno.test("popup flow: getAddress asks the page on the module's network and returns the address", async () => {
  const { dapp, page } = makeWindowPair();
  delete (globalThis.window as Any).veil;

  const mod = new VeilModule({ network: Networks.TESTNET });
  const pending = mod.getAddress();
  assertEquals(dapp.opened, 1);
  page.ready();
  assertEquals(page.last().method, "connect");
  assertEquals(page.last().chain, "stellar");
  assertEquals(page.last().network, "testnet");
  page.reply(page.last().id, ACCOUNT);
  assertEquals(await pending, { address: ACCOUNT.address });
});

Deno.test("popup flow: signTransaction returns signed envelope and signer on the passphrase called", async () => {
  const { page } = makeWindowPair();
  delete (globalThis.window as Any).veil;

  const mod = new VeilModule();
  const pending = mod.signTransaction("AAAA", { networkPassphrase: Networks.PUBLIC, address: ACCOUNT.address });
  page.ready();
  assertEquals(page.last().method, "sign");
  assertEquals(page.last().network, "mainnet");
  assertEquals(page.last().params, { payload: "AAAA", submit: false, address: ACCOUNT.address });
  page.reply(page.last().id, SIGNED);
  assertEquals(await pending, { signedTxXdr: "AAAAAgAA", signerAddress: ACCOUNT.address });
  assertEquals(await mod.getNetwork(), { network: "PUBLIC", networkPassphrase: Networks.PUBLIC });
});

Deno.test("popup flow: signAuthEntry and signMessage return signatures from popup", async () => {
  const { dapp, page } = makeWindowPair();
  delete (globalThis.window as Any).veil;

  const mod = new VeilModule({ network: Networks.TESTNET });
  const auth = mod.signAuthEntry("AAAACQ", { address: ACCOUNT.address });
  page.ready();
  page.reply(page.last().id, { ...ACCOUNT, hash: "H", blob: "AAAACQ", signature: "c2ln" });
  assertEquals(await auth, { signedAuthEntry: "c2ln", signerAddress: ACCOUNT.address });

  const msg = mod.signMessage("hello", { address: ACCOUNT.address });
  page.ready();
  page.reply(page.last().id, { ...ACCOUNT, signature: "bXNn" });
  assertEquals(await msg, { signedMessage: "bXNn", signerAddress: ACCOUNT.address });
  assertEquals(dapp.opened, 2, "a signature closes the page, so the next request opens a popup");
});

Deno.test("unknown passphrase refused with -3 before popup; declined prompt is -4", async () => {
  const { dapp, page } = makeWindowPair();
  delete (globalThis.window as Any).veil;

  const mod = new VeilModule();
  const e = await assertRejects(() =>
    mod.signTransaction("AAAA", { networkPassphrase: "Standalone Network ; February 2017" })
  );
  assertEquals((e as { code: number }).code, -3);
  assertEquals(dapp.opened, 0);
  assertEquals(await mod.getNetwork(), { network: "PUBLIC", networkPassphrase: Networks.PUBLIC });

  const pending = mod.getAddress();
  page.ready();
  page.fail(page.last().id, { code: -4, message: "declined" });
  const declined = await assertRejects(() => pending);
  assertEquals((declined as { code: number; message: string }).code, -4);
  assertEquals((declined as { code: number; message: string }).message, "declined");
});

Deno.test("signAndSubmitTransaction: success once validated, pending while open, refused when nothing went out", async () => {
  const { page } = makeWindowPair();
  delete (globalThis.window as Any).veil;

  const mod = new VeilModule({ network: Networks.TESTNET });
  const submit = (answer: Any) => {
    const pending = mod.signAndSubmitTransaction("AAAA", { address: ACCOUNT.address });
    page.ready();
    assertEquals(page.last().params, { payload: "AAAA", submit: true, address: ACCOUNT.address });
    page.reply(page.last().id, { ...SIGNED, ...answer });
    return pending;
  };
  const refused = async (answer: Any) => await assertRejects(() => submit(answer));

  assertEquals(await submit({ submitted: { kind: "validated", ledger: 7, ok: true } }), { status: "success" });
  for (const submitted of [{ kind: "lost" }, { kind: "unknown" }, { kind: "validated", ledger: 7, ok: null }]) {
    assertEquals(await submit({ submitted }), { status: "pending" });
  }
  for (const kind of ["offline", "unsent", "locked", "moved"]) {
    assertEquals(await refused({ submitted: { kind } }), {
      code: -2,
      message: `Nothing was submitted: ${kind}. Transaction hash: CAFE`,
    });
  }
  assertEquals(await refused({ handOver: "a login challenge" }), {
    code: -2,
    message: "Nothing was submitted: a login challenge. Transaction hash: CAFE",
  });
  assertEquals(await refused({ submitted: { kind: "refused", code: "tx_bad_seq", ok: false } }), {
    code: -2,
    message: "The transaction failed: tx_bad_seq. Transaction hash: CAFE",
  });
});
