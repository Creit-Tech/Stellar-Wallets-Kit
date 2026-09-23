/// <reference lib="deno.ns" />
import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import { Networks } from "../../types/mod.ts";
import { GhostsigModule } from "./ghostsig.module.ts";

/**
 * GHOSTSIG is a hosted wallet reached through a popup. The module opens
 * ghostsig.dev and sends one request per signature over postMessage, taking
 * replies from that origin and that popup only. These tests install the app's
 * window as the global `window` and script the page's replies.
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
      for (const fn of [...listeners]) fn({ origin: "https://ghostsig.dev", source: popup, data });
    },
    ready() {
      this.post({ ghostsig: 1, type: "ready" });
    },
    reply(id: string, result: unknown) {
      this.post({ ghostsig: 1, id, type: "result", result });
    },
    fail(id: string, error: { code: number; message: string }) {
      this.post({ ghostsig: 1, id, type: "error", error });
    },
  };
  globalThis.window = dapp;
  return { dapp, page, popup };
}

const ACCOUNT = { address: "GGHOSTSIG", publicKey: "ab".repeat(32) };
const SIGNED = { ...ACCOUNT, hash: "CAFE", blob: "AAAAAgAA", signature: "ff".repeat(64) };

Deno.test("metadata: a hot wallet, always available, with its icon", async () => {
  makeWindowPair();
  const mod = new GhostsigModule();
  assertEquals(mod.productId, "ghostsig");
  assertEquals(mod.productName, "GHOSTSIG");
  assertEquals(mod.productIcon.startsWith("data:image/svg+xml;base64,"), true);
  assertEquals(await mod.isAvailable(), true);
});

Deno.test("getAddress asks the page on the module's network and returns the address", async () => {
  const { dapp, page } = makeWindowPair();
  const mod = new GhostsigModule({ network: Networks.TESTNET });
  const pending = mod.getAddress();
  assertEquals(dapp.opened, 1);
  page.ready();
  assertEquals(page.last().method, "connect");
  assertEquals(page.last().chain, "stellar");
  assertEquals(page.last().network, "testnet");
  page.reply(page.last().id, ACCOUNT);
  assertEquals(await pending, { address: "GGHOSTSIG" });
});

Deno.test("signTransaction returns the signed envelope and the signer, on the passphrase the call names", async () => {
  const { page } = makeWindowPair();
  const mod = new GhostsigModule();
  const pending = mod.signTransaction("AAAA", { networkPassphrase: Networks.PUBLIC, address: "GGHOSTSIG" });
  page.ready();
  assertEquals(page.last().method, "sign");
  assertEquals(page.last().network, "mainnet");
  assertEquals(page.last().params, { payload: "AAAA", submit: false, address: "GGHOSTSIG" });
  page.reply(page.last().id, SIGNED);
  assertEquals(await pending, { signedTxXdr: "AAAAAgAA", signerAddress: "GGHOSTSIG" });
  assertEquals(await mod.getNetwork(), { network: "PUBLIC", networkPassphrase: Networks.PUBLIC });
});

Deno.test("signAuthEntry and signMessage return the base64 signature the page gives", async () => {
  const { dapp, page } = makeWindowPair();
  const mod = new GhostsigModule({ network: Networks.TESTNET });
  const auth = mod.signAuthEntry("AAAACQ", { address: "GGHOSTSIG" });
  page.ready();
  page.reply(page.last().id, { ...ACCOUNT, hash: "H", blob: "AAAACQ", signature: "c2ln" });
  assertEquals(await auth, { signedAuthEntry: "c2ln", signerAddress: "GGHOSTSIG" });
  const msg = mod.signMessage("hello", { address: "GGHOSTSIG" });
  page.ready();
  page.reply(page.last().id, { ...ACCOUNT, signature: "bXNn" });
  assertEquals(await msg, { signedMessage: "bXNn", signerAddress: "GGHOSTSIG" });
  assertEquals(dapp.opened, 2, "a signature closes the page, so the next request opens a popup");
});

Deno.test("an unknown passphrase is refused with -3 before any popup and leaves the network; a declined prompt is -4", async () => {
  const { dapp, page } = makeWindowPair();
  const mod = new GhostsigModule();
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
  const mod = new GhostsigModule({ network: Networks.TESTNET });
  const submit = (answer: Any) => {
    const pending = mod.signAndSubmitTransaction("AAAA", { address: "GGHOSTSIG" });
    page.ready();
    assertEquals(page.last().params, { payload: "AAAA", submit: true, address: "GGHOSTSIG" });
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
  assertEquals(await refused({ handOver: "a login challenge for app.example" }), {
    code: -2,
    message: "Nothing was submitted: a login challenge for app.example. Transaction hash: CAFE",
  });
  assertEquals(await refused({ submitted: { kind: "refused", code: "tx_bad_seq", ok: false } }), {
    code: -2,
    message: "The transaction failed: tx_bad_seq. Transaction hash: CAFE",
  });
});
