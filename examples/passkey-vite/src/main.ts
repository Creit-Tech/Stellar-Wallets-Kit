import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { KitEventType, Networks } from "@creit-tech/stellar-wallets-kit/types";
import { FreighterModule } from "@creit-tech/stellar-wallets-kit/modules/freighter";
import { LobstrModule } from "@creit-tech/stellar-wallets-kit/modules/lobstr";
import { xBullModule } from "@creit-tech/stellar-wallets-kit/modules/xbull";
import { PasskeyModule } from "@creit-tech/stellar-wallets-kit/modules/passkey";

import { referenceCheckAuth, signTransaction as coreSignTransaction } from "@soropass/core";
import type { AccountDeployer, AssertionResult, CredentialStorage, WebAuthnSigner } from "@soropass/core";
import { p256 } from "@noble/curves/nist";
import { sha256 } from "@noble/hashes/sha2";

import { Networks as SdkNetworks, xdr } from "@stellar/stellar-sdk";
import {
  type Backend,
  buildBackend,
  EXPLORER,
  FACTORY_ID,
  type Mode,
  NETWORK,
  NETWORK_PASSPHRASE,
  submitToTestnet,
} from "./backends.ts";
import { buildAddSignerCall, sourceSign } from "./transaction.ts";
import {
  deriveVerdict,
  emptyStep,
  loadRun,
  type Run,
  saveRun,
  type Step,
  STEPS,
  type StepResult,
} from "./checklist.ts";

const RP_ID = globalThis.location.hostname;
const RETURNING_FLAG = "swk-passkey-example-returning";
const RUN_KEY = "swk-passkey-example-run";

const el = (id: string): HTMLElement => document.querySelector(`[data-testid="${id}"]`)!;
const ui = (id: string): HTMLElement => document.querySelector(`[data-ui="${id}"]`)!;

const SESSION_IDS = new Set(["wallet", "address", "network", "factory", "source", "error"]);

const set = (id: string, value: string): void => {
  el(id).textContent = value;
  if (SESSION_IDS.has(id)) refreshSession();
};

const short = (v: string): string => `${v.slice(0, 4)}…${v.slice(-4)}`;
const isKey = (v: string): boolean => /^[CG][A-Z2-7]{55}$/.test(v);

/** Renders the pretty session panel from the raw values the suite reads. */
function refreshSession(): void {
  const raw = (id: string): string => el(id).textContent ?? "-";
  const address = raw("address");
  const connected = isKey(address);

  ui("conn-name").textContent = connected ? "Passkey" : "Not connected";
  ui("conn-sub").textContent = connected ? "through the kit modal" : "Step 1 opens the kit modal";
  ui("conn-state").innerHTML = connected
    ? '<span class="dot"></span>connected'
    : '<span class="dot off"></span>offline';

  const acct = ui("acct");
  acct.hidden = !connected;
  if (connected) {
    ui("acct-short").textContent = short(address);
    const link = ui("acct-link") as HTMLAnchorElement;
    link.hidden = !onTestnet;
    if (onTestnet) link.href = `${EXPLORER}/contract/${address}`;
  }

  const network = raw("network");
  ui("network").textContent = network.startsWith("TESTNET")
    ? "Testnet"
    : network.startsWith("PUBLIC")
    ? "Mainnet"
    : network.startsWith("in-memory")
    ? "In-memory, no chain"
    : network;
  ui("network").title = network;

  for (const id of ["factory", "source"] as const) {
    const value = raw(id);
    const target = ui(id);
    const copy = document.querySelector<HTMLButtonElement>(`[data-copy="${id}"]`)!;
    if (isKey(value)) {
      target.textContent = short(value);
      target.classList.remove("muted");
      copy.hidden = false;
    } else {
      target.textContent = value === "-" ? "–" : value;
      target.classList.add("muted");
      copy.hidden = true;
    }
    target.title = value;
  }

  const error = raw("error");
  ui("error-row").hidden = error === "-" || error === "";
  ui("error").textContent = error;
}

for (const button of document.querySelectorAll<HTMLButtonElement>("button[data-copy]")) {
  button.addEventListener("click", async () => {
    const value = el(button.dataset.copy!).textContent ?? "";
    await navigator.clipboard.writeText(value);
    button.classList.add("copied");
    const original = button.innerHTML;
    button.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>';
    setTimeout(() => {
      button.classList.remove("copied");
      button.innerHTML = original;
    }, 1200);
  });
}

function log(line: string): void {
  const stamp = new Date().toISOString().slice(11, 19);
  el("log").textContent = `${stamp}  ${line}\n${el("log").textContent}`;
}

function errorText(e: unknown): string {
  const err = e as { code?: number; message?: string; ext?: string };
  return err?.code !== undefined
    ? `code=${err.code} ext=${err.ext ?? "-"} ${err.message ?? ""}`
    : (e as Error)?.message ?? String(e);
}

function showError(e: unknown): void {
  const text = errorText(e);
  set("error", text);
  log(`ERROR ${text}`);
}

function clearError(): void {
  set("error", "-");
}

const ms = (started: number): string => `${Math.round(performance.now() - started).toLocaleString()} ms`;

// ---------------------------------------------------------------------------
// Mode: testnet for people. `?mode=mock` and `?mode=local` exist for the automated
// suite (in-memory accounts, no network) and are never offered in the UI.
// ---------------------------------------------------------------------------

const params = new URLSearchParams(globalThis.location.search);
const requested = params.get("mode");
const mode: Mode = requested === "mock" || requested === "local" ? requested : "testnet";
const onTestnet = mode === "testnet";

let backend: Backend;
let passkey: PasskeyModule;
/** Set by the deploy wrapper below whenever a connect triggers an on-chain deploy. */
let lastDeploy: { contractId: string; txHash?: string } | undefined;

/**
 * Per-mode credential storage. The default storage keys only on rpId, so on a single
 * origin (localhost) a passkey remembered in `local` mode would leak into `testnet`, and
 * getAddress would derive an address for it that was never deployed on-chain.
 */
function scopedCredentialStorage(m: Mode): CredentialStorage {
  const key = (rpId: string): string => `soropass:credential:${rpId}:${m}`;
  return {
    get: (rpId) => localStorage.getItem(key(rpId)),
    set: (rpId, credentialId) => localStorage.setItem(key(rpId), credentialId),
  };
}

// ---------------------------------------------------------------------------
// The run record: what each step produced, rendered into the step cards
// ---------------------------------------------------------------------------

const run: Run = loadRun();
/** Step 4: Reconnect is offered only once a disconnect has completed in this session. */
let disconnected = false;

function stepResult(id: string): StepResult {
  return run.steps[id] ?? emptyStep();
}

function record(id: string, patch: Partial<StepResult>): void {
  const step = STEPS.find((s) => s.id === id)!;
  const next = { ...stepResult(id), ...patch };
  next.verdict = deriveVerdict(step, next);
  run.steps[id] = next;
  saveRun(run);
  renderSteps();
}

const ICON_OK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>';
const ICON_BAD = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

function renderChecks(step: Step, r: StepResult): void {
  const host = document.querySelector<HTMLElement>(`[data-checks="${step.id}"]`)!;
  host.innerHTML = `<div class="checks-title">Checks</div>`;
  for (const c of step.checks) {
    const state = r.checks[c.id] ?? null;
    const row = document.createElement("div");
    row.className = `check-row${state === true ? " is-ok" : state === false ? " is-bad" : ""}`;
    const who = state === null ? "waiting" : state ? "verified" : "failed";
    row.innerHTML = `<span class="ico">${state === false ? ICON_BAD : ICON_OK}</span><span>${c.label}</span><span class="who">${who}</span>`;
    host.appendChild(row);
  }
}

function renderSteps(): void {
  let activeFound = false;
  for (const step of STEPS) {
    const card = document.querySelector<HTMLElement>(`[data-step="${step.id}"]`)!;
    const r = stepResult(step.id);
    const disabled = step.needs === "testnet" && !onTestnet;
    const started = step.checks.some((c) => (r.checks[c.id] ?? null) !== null) || r.evidence !== "";

    card.classList.remove("is-pass", "is-fail", "is-progress", "is-active", "is-disabled");
    if (r.verdict === "pass" || r.verdict === "fail") card.classList.add(`is-${r.verdict}`);
    else if (started) card.classList.add("is-progress");
    if (disabled) card.classList.add("is-disabled");
    if (!activeFound && !disabled && r.verdict !== "pass") {
      card.classList.add("is-active");
      activeFound = true;
    }

    const stamp = card.querySelector<HTMLElement>("[data-stamp]")!;
    stamp.textContent = disabled
      ? "TESTNET ONLY"
      : r.verdict === "pass"
      ? "PASS"
      : r.verdict === "fail"
      ? "FAIL"
      : started
      ? "IN PROGRESS"
      : "NOT RUN";

    card.querySelector<HTMLElement>("[data-intro]")!.textContent = step.intro;
    renderChecks(step, r);

    const result = card.querySelector<HTMLElement>("[data-result]")!;
    result.textContent = r.evidence;
    for (const link of r.links) {
      result.append(" · ");
      const a = document.createElement("a");
      a.href = link.href;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = link.label;
      result.append(a);
    }

    const flag = card.querySelector<HTMLButtonElement>("[data-flag]")!;
    flag.classList.toggle("on", r.flagged);
    flag.textContent = r.flagged ? "Flagged as a problem" : "Flag a problem";

    const note = card.querySelector<HTMLInputElement>("[data-note]")!;
    if (note.value !== r.note && document.activeElement !== note) note.value = r.note;

    for (const button of card.querySelectorAll<HTMLButtonElement>("button.btn")) {
      button.disabled = disabled;
    }
    if (step.id === "reconnect") el("reconnect").toggleAttribute("disabled", disabled || !disconnected);
  }

  const passed = STEPS.filter((s) => stepResult(s.id).verdict === "pass").length;
  set("progress", `${passed} of ${STEPS.length} passed`);
  el("progress-bar").style.width = `${(passed / STEPS.length) * 100}%`;
}

for (const note of document.querySelectorAll<HTMLInputElement>("input[data-note]")) {
  note.addEventListener("change", () => record(note.dataset.note!, { note: note.value }));
}
for (const flag of document.querySelectorAll<HTMLButtonElement>("button[data-flag]")) {
  flag.addEventListener("click", () => {
    const id = flag.dataset.flag!;
    record(id, { flagged: !stepResult(id).flagged });
  });
}

// ---------------------------------------------------------------------------
// Environment line: browser, OS, platform authenticator
// ---------------------------------------------------------------------------

function browserName(): string {
  const ua = navigator.userAgent;
  const pick = (re: RegExp): string | undefined => {
    const m = ua.match(re);
    return m ? `${m[1]} ${m[2].split(".")[0]}` : undefined;
  };
  return pick(/(Edg)\/([\d.]+)/)?.replace("Edg", "Edge") ??
    pick(/(Firefox)\/([\d.]+)/) ??
    pick(/(Chrome)\/([\d.]+)/) ??
    pick(/(Version)\/([\d.]+).*Safari/)?.replace("Version", "Safari") ??
    "Unknown browser";
}

function osName(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown OS";
}

async function platformAuthenticator(): Promise<boolean> {
  const pkc = (globalThis as unknown as {
    PublicKeyCredential?: { isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean> };
  }).PublicKeyCredential;
  if (!pkc?.isUserVerifyingPlatformAuthenticatorAvailable) return false;
  return pkc.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false);
}

async function renderEnv(): Promise<void> {
  const platform = await platformAuthenticator();
  const authenticator = mode === "mock"
    ? "in-process mock authenticator"
    : platform
    ? "platform authenticator"
    : "no platform authenticator";
  set("env", `${browserName()} · ${osName()} · ${authenticator}`);
  el("env-dot").classList.toggle("off", mode !== "mock" && !platform);
  if (!onTestnet) {
    const chip = el("mode-chip");
    chip.hidden = false;
    chip.textContent = `mode: ${mode} (automated tests)`;
  }
}

// ---------------------------------------------------------------------------
// Counting what a connect touches, for the returning-visitor step
// ---------------------------------------------------------------------------

interface Counts {
  credentialCalls: number;
  rpcCalls: number;
}

/** Run `fn` while counting authenticator ceremonies and Soroban RPC requests. */
async function counting<T>(fn: () => Promise<T>): Promise<{ value: T; counts: Counts }> {
  const counts: Counts = { credentialCalls: 0, rpcCalls: 0 };
  const creds = navigator.credentials as unknown as Record<string, unknown> | undefined;
  const originalGet = creds?.get as ((...a: unknown[]) => unknown) | undefined;
  const originalCreate = creds?.create as ((...a: unknown[]) => unknown) | undefined;
  // Own properties (a test double) are restored; prototype methods are un-shadowed.
  const ownGet = creds !== undefined && Object.hasOwn(creds, "get");
  const ownCreate = creds !== undefined && Object.hasOwn(creds, "create");
  const originalFetch = globalThis.fetch;
  const rpcHost = new URL(NETWORK.rpcUrl).host;

  if (creds && originalGet && originalCreate) {
    creds.get = (...a: unknown[]) => {
      counts.credentialCalls++;
      return originalGet.apply(navigator.credentials, a);
    };
    creds.create = (...a: unknown[]) => {
      counts.credentialCalls++;
      return originalCreate.apply(navigator.credentials, a);
    };
  }
  globalThis.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes(rpcHost)) counts.rpcCalls++;
    return originalFetch(input, init);
  };

  try {
    return { value: await fn(), counts };
  } finally {
    globalThis.fetch = originalFetch;
    if (creds && originalGet && originalCreate) {
      if (ownGet) creds.get = originalGet;
      else delete creds.get;
      if (ownCreate) creds.create = originalCreate;
      else delete creds.create;
    }
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

async function boot(): Promise<void> {
  void renderEnv();
  renderSteps();

  set("network", onTestnet ? `TESTNET (${NETWORK_PASSPHRASE})` : `in-memory (${NETWORK_PASSPHRASE})`);
  set("factory", onTestnet ? FACTORY_ID : "not used in this mode");
  set("source", onTestnet ? "funding…" : "not used in this mode");

  backend = await buildBackend(mode, log);

  // Wrap the deployer so a connect that deploys on-chain surfaces its tx hash to the UI.
  const deployer: AccountDeployer = {
    deploy: async (input) => {
      const result = await backend.deployer.deploy(input);
      lastDeploy = result;
      return result;
    },
  };

  passkey = new PasskeyModule({
    rpId: RP_ID,
    rpName: "Stellar Wallets Kit reference",
    networkPassphrase: NETWORK_PASSPHRASE,
    network: "TESTNET",
    deployer,
    indexer: backend.indexer,
    // Only set on testnet: offline address derivation needs the real factory.
    factoryContractId: backend.factoryContractId,
    storage: scopedCredentialStorage(mode),
    webauthn: backend.authenticator,
    signer: backend.authenticator?.sign,
  });

  StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: [new FreighterModule(), new LobstrModule(), new xBullModule(), passkey],
    authModal: { hideUnsupportedWallets: false },
  });

  StellarWalletsKit.on(KitEventType.STATE_UPDATED, (e) => set("address", e.payload.address ?? "-"));
  StellarWalletsKit.on(KitEventType.WALLET_SELECTED, (e) => set("wallet", e.payload.id ?? "-"));
  StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
    set("address", "-");
    set("wallet", "-");
    log("disconnected");
  });

  if (backend.sourceSecret) {
    const { Keypair } = await import("@stellar/stellar-sdk");
    set("source", Keypair.fromSecret(backend.sourceSecret).publicKey());
  }

  // Step 5, second half: the page was reloaded on purpose and now expects a connect.
  if (sessionStorage.getItem(RETURNING_FLAG)) {
    el("reload").hidden = true;
    el("returning-connect").hidden = false;
    record("returning", { evidence: "reloaded. Now click Connect wallet here and pick Passkey.", checks: { same: null, noceremony: null, norpc: null } });
  }

  log(`ready in ${mode} mode, rpId=${RP_ID}`);
}

// ---------------------------------------------------------------------------
// The public key of the connected account, for the local __check_auth run
// ---------------------------------------------------------------------------

/**
 * The workspace build of @soropass/core types its XDR against its own stellar-sdk
 * copy, so the entry needs a cast at the type level only; at runtime Vite dedupes
 * both packages to one stellar-sdk instance (see vite.config.ts).
 */
const asCoreEntry = (entry: xdr.SorobanAuthorizationEntry): Parameters<typeof referenceCheckAuth>[0] =>
  entry as unknown as Parameters<typeof referenceCheckAuth>[0];

/** The first Soroban auth entry of a v1 envelope (stellar-sdk 17 property-style XDR). */
function firstAuthEntry(envelopeXdr: string): xdr.SorobanAuthorizationEntry {
  const envelope = xdr.TransactionEnvelope.fromXDR(envelopeXdr, "base64");
  if (envelope.type !== "envelopeTypeTx") throw new Error("expected a v1 envelope");
  const body = envelope.v1.tx.operations[0].body;
  if (body.type !== "invokeHostFunction") throw new Error("expected invokeHostFunction");
  return body.invokeHostFunctionOp.auth[0];
}

function memoryPublicKey(address: string): Uint8Array | undefined {
  for (const account of backend.memory?.registry.values() ?? []) {
    if (account.contractId === address) return account.publicKey;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Connecting, shared by steps 1, 4 and 5. Always through the kit's auth modal.
// ---------------------------------------------------------------------------

async function connectThroughKit(): Promise<{ address: string; elapsed: string; counts: Counts }> {
  const started = performance.now();
  const { value, counts } = await counting(() => StellarWalletsKit.authModal());
  const elapsed = ms(started);
  set("address", value.address);
  const network = await StellarWalletsKit.getNetwork();
  set("network", `${network.network} (${network.networkPassphrase})`);
  log(`connected ${value.address} in ${elapsed}`);
  return { address: value.address, elapsed, counts };
}

function explorerLinks(address: string): { label: string; href: string }[] {
  if (!onTestnet) return [];
  const links = [{ label: "view contract", href: `${EXPLORER}/contract/${address}` }];
  if (lastDeploy?.contractId === address && lastDeploy.txHash) {
    links.push({ label: "deploy tx", href: `${EXPLORER}/tx/${lastDeploy.txHash}` });
  }
  return links;
}

// ---------------------------------------------------------------------------
// Step 1: connect
// ---------------------------------------------------------------------------

el("connect").addEventListener("click", async () => {
  clearError();
  record("connect", { evidence: "waiting for the kit modal…", links: [], checks: { ...stepResult("connect").checks, address: null } });
  try {
    const { address, elapsed } = await connectThroughKit();
    const deployed = lastDeploy?.contractId === address;
    const evidence = onTestnet
      ? `${address} · ${elapsed} · ${deployed ? "deployed through the factory" : "existing account"}`
      : `${address} · ${elapsed} · in-memory account`;
    if (onTestnet && deployed && lastDeploy?.txHash) log(`deployed on testnet, tx=${lastDeploy.txHash}`);
    record("connect", { evidence, links: explorerLinks(address), address, checks: { ...stepResult("connect").checks, address: true } });
  } catch (e) {
    showError(e);
    record("connect", { evidence: errorText(e), links: [], checks: { ...stepResult("connect").checks, address: false } });
  }
});

// ---------------------------------------------------------------------------
// Step 2: sign a transaction
// ---------------------------------------------------------------------------

el("sign-tx").addEventListener("click", async () => {
  clearError();
  record("sign", { evidence: "building the transaction…", links: [], checks: { ...stepResult("sign").checks, accepted: null } });
  try {
    const started = performance.now();
    const { address } = await StellarWalletsKit.getAddress();

    if (onTestnet) {
      log("simulating add_signer() on the account (passkey must authorize it)...");
      const unsigned = await buildAddSignerCall(address);
      record("sign", { evidence: "waiting for the passkey signature through the kit…" });
      log("requesting the passkey signature through the kit...");
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsigned, { address });
      const full = await sourceSign(signedTxXdr);
      record("sign", { evidence: "submitting to testnet…" });
      log("submitting to testnet...");
      const result = await submitToTestnet(full);
      const ok = result.status === "SUCCESS";
      log(`on-chain ${result.status} tx=${result.hash}`);
      record("sign", {
        evidence: `${ok ? "PASS" : "FAIL"}: on-chain __check_auth ${result.status} · tx ${result.hash} · ${ms(started)}`,
        links: [{ label: "open on Stellar Expert", href: `${EXPLORER}/tx/${result.hash}` }],
        checks: { ...stepResult("sign").checks, accepted: ok },
      });
      return;
    }

    // In-memory modes: build a local Soroban envelope and verify it here.
    const unsigned = await localEnvelope(address);
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsigned, { address });
    const entry = firstAuthEntry(signedTxXdr);
    const publicKey = memoryPublicKey(address);
    if (!publicKey) throw new Error("no registered public key for the connected account");
    const verdict = referenceCheckAuth(asCoreEntry(entry), publicKey, SdkNetworks.TESTNET);
    log(`local __check_auth: ${verdict.success ? "PASS" : "FAIL"}`);
    record("sign", {
      evidence: verdict.success
        ? `PASS: local __check_auth accepts the signature · ${ms(started)}`
        : `FAIL: ${JSON.stringify(verdict)}`,
      links: [],
      checks: { ...stepResult("sign").checks, accepted: verdict.success },
    });
  } catch (e) {
    showError(e);
    record("sign", { evidence: `FAIL: ${errorText(e)}`, links: [], checks: { ...stepResult("sign").checks, accepted: false } });
  }
});

// ---------------------------------------------------------------------------
// Step 3: a wrong key must be rejected on-chain
// ---------------------------------------------------------------------------

el("wrong-key").addEventListener("click", async () => {
  clearError();
  record("wrong-key", { evidence: "signing with a random software key…", links: [], checks: { ...stepResult("wrong-key").checks, rejected: null } });

  // Signing with the wrong key must succeed locally: a client-side failure here proves
  // nothing about the contract, so it is a FAIL of the step, not a rejection.
  let full: string;
  try {
    const { address } = await StellarWalletsKit.getAddress();
    const unsigned = await buildAddSignerCall(address);
    log("signing with a random software key (not the passkey)...");
    const { sign, publicKey } = softwareSigner();
    const signedAuth = await coreSignTransaction(unsigned, { networkPassphrase: NETWORK_PASSPHRASE, sign, publicKey });
    full = await sourceSign(signedAuth);
  } catch (e) {
    showError(e);
    record("wrong-key", {
      evidence: `FAIL: could not build the wrong-key transaction · ${errorText(e)}`,
      links: [],
      checks: { ...stepResult("wrong-key").checks, rejected: false },
    });
    return;
  }

  record("wrong-key", { evidence: "submitting to testnet…" });
  try {
    const result = await submitToTestnet(full);
    const rejected = result.status !== "SUCCESS";
    log(`wrong key -> ${result.status}`);
    record("wrong-key", {
      evidence: rejected
        ? `PASS: rejected on-chain (${result.status}) · tx ${result.hash}`
        : `FAIL: a wrong key was accepted · tx ${result.hash}`,
      links: [{ label: "open on Stellar Expert", href: `${EXPLORER}/tx/${result.hash}` }],
      checks: { ...stepResult("wrong-key").checks, rejected },
    });
  } catch (e) {
    // The network refused the envelope outright (the usual shape of an auth failure).
    const text = errorText(e);
    log(`wrong key rejected by the network: ${text}`);
    record("wrong-key", { evidence: `PASS: rejected by the network · ${text}`, links: [], checks: { ...stepResult("wrong-key").checks, rejected: true } });
  }
});

// ---------------------------------------------------------------------------
// Step 4: disconnect, then reconnect to the same account
// ---------------------------------------------------------------------------

el("disconnect").addEventListener("click", async () => {
  clearError();
  disconnected = false;
  record("reconnect", { evidence: "disconnecting…", links: [], checks: { cleared: null, same: null, nodeploy: null } });
  await StellarWalletsKit.disconnect();
  disconnected = true;
  const cleared = el("address").textContent === "-";
  record("reconnect", {
    evidence: cleared ? "disconnected. Now click Reconnect and pick Passkey." : "FAIL: the kit still reports an address after disconnect",
    checks: { ...stepResult("reconnect").checks, cleared },
  });
});

el("reconnect").addEventListener("click", async () => {
  clearError();
  disconnected = false;
  renderSteps();
  const deployBefore = lastDeploy;
  try {
    const before = stepResult("connect").address;
    const { address, elapsed } = await connectThroughKit();
    const same = before !== undefined && before === address;
    const nodeploy = lastDeploy === deployBefore;
    record("reconnect", {
      evidence: same
        ? `PASS: same address as step 1 · ${elapsed}${nodeploy ? "" : " · but a new account was deployed"}`
        : `FAIL: got ${address}, step 1 had ${before ?? "no address"}`,
      links: [],
      address,
      checks: { ...stepResult("reconnect").checks, same, nodeploy },
    });
  } catch (e) {
    showError(e);
    record("reconnect", { evidence: `FAIL: ${errorText(e)}`, links: [], checks: { ...stepResult("reconnect").checks, same: false } });
  }
});

// ---------------------------------------------------------------------------
// Step 5: reload, then connect with no ceremony and no RPC call
// ---------------------------------------------------------------------------

el("reload").addEventListener("click", () => {
  sessionStorage.setItem(RETURNING_FLAG, "1");
  globalThis.location.reload();
});

el("returning-connect").addEventListener("click", async () => {
  clearError();
  try {
    const before = stepResult("connect").address;
    const { address, elapsed, counts } = await connectThroughKit();
    const same = before !== undefined && before === address;
    const noceremony = counts.credentialCalls === 0;
    const norpc = counts.rpcCalls === 0;
    const facts = `${counts.credentialCalls} authenticator ceremonies · ${counts.rpcCalls} RPC calls · ${elapsed}`;
    record("returning", {
      evidence: same && noceremony && norpc
        ? `PASS: same address, derived offline · ${facts}`
        : `FAIL: ${same ? "same address" : `different address ${address}`} · ${facts}`,
      links: [],
      address,
      checks: { same, noceremony, norpc },
    });
    sessionStorage.removeItem(RETURNING_FLAG);
    el("reload").hidden = false;
    el("returning-connect").hidden = true;
  } catch (e) {
    showError(e);
    record("returning", { evidence: `FAIL: ${errorText(e)}`, links: [], checks: { same: false, noceremony: null, norpc: null } });
  }
});

// ---------------------------------------------------------------------------
// Other kit calls, off the main path
// ---------------------------------------------------------------------------

const other = (call: string, text: string): void => set(`result-${call}`, text);

el("sign-auth-entry").addEventListener("click", async () => {
  clearError();
  try {
    const { address } = await StellarWalletsKit.getAddress();
    const unsigned = await localEnvelope(address);
    const entryXdr = firstAuthEntry(unsigned).toXDR("base64");
    const { signedAuthEntry } = await StellarWalletsKit.signAuthEntry(entryXdr, { address });
    log(`signed auth entry (${signedAuthEntry.length} chars)`);
    const publicKey = memoryPublicKey(address);
    if (publicKey) {
      const entry = xdr.SorobanAuthorizationEntry.fromXDR(signedAuthEntry, "base64");
      const verdict = referenceCheckAuth(asCoreEntry(entry), publicKey, SdkNetworks.TESTNET);
      other("sign-auth-entry", verdict.success
        ? `PASS: local __check_auth accepts the auth entry (${signedAuthEntry.length} chars)`
        : `FAIL: ${JSON.stringify(verdict)}`);
    } else {
      other("sign-auth-entry", `signed entry returned (${signedAuthEntry.length} chars base64)`);
    }
  } catch (e) {
    showError(e);
    other("sign-auth-entry", `failed: ${errorText(e)}`);
  }
});

el("sign-message").addEventListener("click", async () => {
  clearError();
  try {
    const { signedMessage } = await StellarWalletsKit.signMessage("hello from the kit");
    log(`signed message: ${signedMessage}`);
    other("sign-message", signedMessage);
  } catch (e) {
    showError(e);
    other("sign-message", `failed: ${errorText(e)}`);
  }
});

el("silent").addEventListener("click", async () => {
  clearError();
  try {
    const started = performance.now();
    const { address } = await passkey.getAddress({ skipRequestAccess: true });
    const text = `${address} in ${ms(started)}, no prompt`;
    log(`silent getAddress -> ${text}`);
    other("silent", text);
  } catch (e) {
    showError(e);
    other("silent", `refused, as it must when nothing is cached: ${errorText(e)}`);
  }
});

el("profile").addEventListener("click", async () => {
  clearError();
  try {
    await StellarWalletsKit.profileModal();
    other("profile", "profile modal opened");
  } catch (e) {
    showError(e);
    other("profile", `failed: ${errorText(e)}`);
  }
});

el("reset").addEventListener("click", () => {
  for (const key of Object.keys(localStorage)) {
    if ((key.includes("soropass") || key.startsWith("swk-")) && key !== RUN_KEY) localStorage.removeItem(key);
  }
  sessionStorage.removeItem("swk-passkey-example-source");
  sessionStorage.removeItem(RETURNING_FLAG);
  const text = "cleared the remembered credential and the fee source. Reload for a true first run.";
  log(text);
  other("reset", text);
});

el("log-toggle").addEventListener("click", (e) => {
  e.preventDefault();
  const open = el("log").classList.toggle("open");
  set("log-toggle", open ? "collapse" : "expand");
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function localEnvelope(contractId: string): Promise<string> {
  const { Account, Address, Keypair, Operation, TransactionBuilder } = await import("@stellar/stellar-sdk");
  const account = new Address(contractId);
  const target = new Address(contractId);
  const entry = new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
      new xdr.SorobanAddressCredentials({
        address: account.toScAddress(),
        nonce: BigInt(Math.floor(Math.random() * 1_000_000)),
        signatureExpirationLedger: 100_000,
        signature: xdr.ScVal.scvVoid(),
      }),
    ),
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
      function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
        new xdr.InvokeContractArgs({ contractAddress: target.toScAddress(), functionName: "add_signer", args: [] }),
      ),
      subInvocations: [],
    }),
  });
  const op = Operation.invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeInvokeContract(
      new xdr.InvokeContractArgs({ contractAddress: target.toScAddress(), functionName: "protected", args: [] }),
    ),
    auth: [entry],
  });
  return new TransactionBuilder(new Account(Keypair.random().publicKey(), "0"), {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(op).setTimeout(60).build().toXDR();
}

/**
 * A random P-256 key that is not the passkey, for the on-chain rejection check. The v0.2
 * auth entry carries the signer's public key inline, so the key travels with the signer.
 */
function softwareSigner(): { sign: WebAuthnSigner; publicKey: Uint8Array } {
  const priv = p256.utils.randomPrivateKey();
  const publicKey = p256.getPublicKey(priv, false);
  const sign = (challenge: string): AssertionResult => {
    const rpIdHash = sha256(new TextEncoder().encode(RP_ID));
    const authenticatorData = new Uint8Array([...rpIdHash, 0x05, 0, 0, 0, 1]);
    const clientDataJSON = new TextEncoder().encode(
      JSON.stringify({ type: "webauthn.get", challenge, origin: globalThis.location.origin }),
    );
    const payload = sha256(new Uint8Array([...authenticatorData, ...sha256(clientDataJSON)]));
    return {
      authenticatorData,
      clientDataJSON,
      signature: p256.sign(payload, priv).toDERRawBytes(),
      credentialId: new Uint8Array(16).fill(2),
    };
  };
  return { sign, publicKey };
}

// ---------------------------------------------------------------------------
// Reset: forget everything and reload for a true first run
// ---------------------------------------------------------------------------

el("reset-run").addEventListener("click", async () => {
  try {
    await StellarWalletsKit.disconnect();
  } catch {
    // nothing was connected
  }
  for (const key of Object.keys(localStorage)) {
    if (key.includes("soropass") || key.startsWith("swk-")) localStorage.removeItem(key);
  }
  sessionStorage.removeItem("swk-passkey-example-source");
  sessionStorage.removeItem(RETURNING_FLAG);
  globalThis.location.reload();
});

boot().catch(showError);
