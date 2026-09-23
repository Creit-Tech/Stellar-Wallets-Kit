/**
 * GHOSTSIG module for the Stellar Wallets Kit.
 *
 * GHOSTSIG (https://ghostsig.dev) is a hosted wallet with no extension and no
 * stored private key: a passkey's PRF output is expanded into an ed25519 key
 * for one signature and zeroed. The module opens ghostsig.dev as a popup and
 * sends one request per signature over postMessage, to that origin only. One
 * passkey prompt approves one signature; the hash is the WebAuthn challenge.
 * The popup client at the bottom is a copy of sdk/popup.ts in the GHOSTSIG
 * repository, so this module needs no dependency and no polyfill.
 */

import { type ModuleInterface, ModuleType, Networks } from "../../types/mod.ts";

export const GHOSTSIG_ID = "ghostsig";

interface GhostsigSignature extends GhostsigConnectResult {
  signature: string;
}

/** The page's `submitted.kind` for a transaction it never sent. */
const GHOSTSIG_UNSENT = ["offline", "unsent", "locked", "moved", "handOver"];

/** The page's ledger id and the SEP-43 name, for each network GHOSTSIG knows. */
const GHOSTSIG_NETWORKS: Record<string, { id: string; name: string }> = {
  [Networks.PUBLIC]: { id: "mainnet", name: "PUBLIC" },
  [Networks.TESTNET]: { id: "testnet", name: "TESTNET" },
  [Networks.FUTURENET]: { id: "futurenet", name: "FUTURENET" },
};

export class GhostsigModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = GHOSTSIG_ID;
  productName: string = "GHOSTSIG";
  productUrl: string = "https://ghostsig.dev";
  productIcon: string = GHOSTSIG_ICON;

  private address: string | null = null;
  private passphrase: string = Networks.PUBLIC;
  /** Where the page is and how long it may take, as given: passed on only when set. */
  private readonly page: { url?: string; timeoutMs?: number };

  constructor(params: { network?: Networks | string; url?: string; timeoutMs?: number } = {}) {
    const { network, ...page } = params;
    if (network) this.passphrase = network;
    this.page = page;
  }

  async isAvailable(): Promise<boolean> {
    return typeof globalThis.window?.open === "function";
  }

  async getAddress(): Promise<{ address: string }> {
    const result = await this.request<GhostsigConnectResult>("connect", {}, undefined);
    this.address = result.address;
    return { address: result.address };
  }

  async signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    const params = { payload: xdr, submit: false, address: this.signer(opts) };
    const result = await this.request<GhostsigSignResult>("sign", params, opts?.networkPassphrase);
    return { signedTxXdr: result.blob, signerAddress: result.address };
  }

  async signAuthEntry(
    authEntry: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    const params = { payload: authEntry, address: this.signer(opts) };
    const result = await this.request<GhostsigSignature>("signAuthEntry", params, opts?.networkPassphrase);
    return { signedAuthEntry: result.signature, signerAddress: result.address };
  }

  async signMessage(
    message: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    const params = { message, address: this.signer(opts) };
    const result = await this.request<GhostsigSignature>("signMessage", params, opts?.networkPassphrase);
    return { signedMessage: result.signature, signerAddress: result.address };
  }

  async signAndSubmitTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string },
  ): Promise<{ status: "success" | "pending" }> {
    const params = { payload: xdr, submit: true, address: this.signer(opts) };
    const result = await this.request<GhostsigSignResult>("sign", params, opts?.networkPassphrase);
    const { handOver, submitted, hash } = result;
    if (handOver || (submitted && GHOSTSIG_UNSENT.includes(submitted.kind))) {
      throw { code: -2, message: `Nothing was submitted: ${handOver || submitted?.kind}. Transaction hash: ${hash}` };
    }
    if (submitted?.ok === false) {
      throw {
        code: -2,
        message: `The transaction failed: ${submitted.code ?? submitted.kind}. Transaction hash: ${hash}`,
      };
    }
    return { status: submitted?.ok === true ? "success" : "pending" };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return { network: this.network().name, networkPassphrase: this.passphrase };
  }

  async disconnect(): Promise<void> {
    this.address = null;
  }

  private signer(opts?: { address?: string }): string | undefined {
    return opts?.address ?? this.address ?? undefined;
  }

  /** The network a call names, which becomes the module's, or the module's own. */
  private network(passphrase?: string): { id: string; name: string } {
    const asked = passphrase || this.passphrase;
    const network = GHOSTSIG_NETWORKS[asked];
    if (!network) throw { code: -3, message: `GHOSTSIG does not know the network "${asked}"` };
    this.passphrase = asked;
    return network;
  }

  private async request<T>(
    method: string,
    params: Record<string, unknown>,
    passphrase: string | undefined,
  ): Promise<T> {
    const { id } = this.network(passphrase);
    try {
      return await ghostsigRequest<T>({ chain: "stellar", network: id, method, params, ...this.page });
    } catch (e) {
      if (e instanceof GhostsigError) throw { code: e.code, message: e.message, ext: e.ext };
      throw { code: -1, message: e instanceof Error ? e.message : String(e) };
    }
  }
}

// ghostsig-icon:begin
const GHOSTSIG_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDQ0IDQ0IiBmaWxsPSJub25lIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkdIT1NUU0lHIj48ZyBzaGFwZS1yZW5kZXJpbmc9ImNyaXNwRWRnZXMiIGZpbGw9IiNGRjJFODgiPjxyZWN0IHg9IjEyIiB5PSIwIiAgd2lkdGg9IjIwIiBoZWlnaHQ9IjQiLz48cmVjdCB4PSI4IiAgeT0iNCIgIHdpZHRoPSIyOCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iNCIgIHk9IjgiICB3aWR0aD0iMzYiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjAiICB5PSIxMiIgd2lkdGg9IjQ0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSIwIiAgeT0iMTYiIHdpZHRoPSI4IiAgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iMzYiIHk9IjE2IiB3aWR0aD0iOCIgIGhlaWdodD0iNCIvPjxyZWN0IHg9IjAiICB5PSIyMCIgd2lkdGg9IjQ0IiBoZWlnaHQ9IjE2Ii8+PHJlY3QgeD0iMCIgIHk9IjM2IiB3aWR0aD0iOCIgIGhlaWdodD0iOCIvPjxyZWN0IHg9IjEyIiB5PSIzNiIgd2lkdGg9IjgiICBoZWlnaHQ9IjgiLz48cmVjdCB4PSIyNCIgeT0iMzYiIHdpZHRoPSI4IiAgaGVpZ2h0PSI4Ii8+PHJlY3QgeD0iMzYiIHk9IjM2IiB3aWR0aD0iOCIgIGhlaWdodD0iOCIvPjwvZz48cmVjdCB4PSI4IiB5PSIxNiIgd2lkdGg9IjI4IiBoZWlnaHQ9IjQiIGZpbGw9IiNDOEZGMDAiIHNoYXBlLXJlbmRlcmluZz0iY3Jpc3BFZGdlcyIvPjwvc3ZnPg==";
// ghostsig-icon:end

// ghostsig-popup:begin
const GHOSTSIG_PROTOCOL = 1;
/** The page the client opens, unless a request names a copy on localhost. */
const GHOSTSIG_URL = "https://ghostsig.dev/?connect";
/** How long a connect's popup is reused. The page holds it open a little longer than this. */
const GHOSTSIG_REUSE_MS = 1_500;
const GHOSTSIG_READY_MS = 10_000;
const GHOSTSIG_TIMEOUT_MS = 60_000;

/** SEP-43 codes: -1 internal, -2 external service, -3 bad request or unsupported, -4 rejected. */
type GhostsigCode = -1 | -2 | -3 | -4;
/**
 * The client's own failures, which the page never sends: the popup blocked or closed, no answer,
 * a reply for another account, or a malformed one.
 */
type GhostsigExt =
  | "popup_blocked"
  | "popup_closed"
  | "timeout"
  | "unreachable"
  | "account_mismatch"
  | "bad_reply";

/**
 * What {@linkcode ghostsigRequest} rejects with: a SEP-43 `code`, and `ext` when the client failed
 * rather than the page.
 */
class GhostsigError extends Error {
  readonly code: GhostsigCode;
  readonly ext?: GhostsigExt;
  constructor(code: GhostsigCode, message: string, ext?: GhostsigExt) {
    super(message);
    this.name = "GhostsigError";
    this.code = code;
    if (ext) this.ext = ext;
  }
}

/** What `connect` returns: the address, and its raw 32-byte ed25519 public key as hex. */
interface GhostsigConnectResult {
  address: string;
  publicKey: string;
}
/**
 * The page's report on a submission: `kind` says whether the transaction went out, and `ok`
 * whether the ledger applied it.
 */
interface GhostsigSubmitted {
  kind: string;
  code?: string;
  ledger?: number | string;
  ok?: boolean;
}
/**
 * What `sign` returns: the signed transaction as `blob`, its `hash` and `signature`.
 * `handOver` says why it came back unsubmitted, and `submitted` reports a submission.
 */
interface GhostsigSignResult extends GhostsigConnectResult {
  hash: string;
  blob: string;
  signature: string;
  handOver?: string;
  submitted?: GhostsigSubmitted;
}

/**
 * One request: `chain` and `network` as the page names them, the `method` and its `params`. `url`
 * opens a copy of the page on localhost, and `timeoutMs` bounds the wait, a minute by default.
 */
interface GhostsigRequest {
  chain: string;
  network: string;
  method: string;
  params?: Record<string, unknown>;
  url?: string;
  timeoutMs?: number;
}

/** The popup a connect left open, for the signature a login asks for next. */
const ghostsigHeld = new WeakMap<
  Window,
  { popup: Window; origin: string; chain: string; network: string; at: number }
>();

/** The pages this client opens: ghostsig.dev, or a copy on localhost, its own passkey relying party. */
function ghostsigPageUrl(url: string | undefined): URL | GhostsigError {
  let parsed: URL;
  try {
    parsed = new URL(url ?? GHOSTSIG_URL);
  } catch {
    return new GhostsigError(-3, `"${String(url)}" is not a URL`);
  }
  if (parsed.origin === new URL(GHOSTSIG_URL).origin) return parsed;
  if (parsed.hostname === "localhost" && parsed.protocol === "http:") return parsed;
  return new GhostsigError(
    -3,
    `GHOSTSIG is at ${new URL(GHOSTSIG_URL).origin}. A copy at ${parsed.origin} is not opened`,
  );
}

function ghostsigFeatures(win: Window): string {
  const width = 420;
  const height = 720;
  const outerW = win.outerWidth || win.screen?.width || width;
  const outerH = win.outerHeight || win.screen?.height || height;
  const left = Math.max(0, Math.round((win.screenX || 0) + (outerW - width) / 2));
  const top = Math.max(0, Math.round((win.screenY || 0) + (outerH - height) / 2));
  return `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
}

function ghostsigId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function ghostsigCheckResult(
  method: string,
  params: Record<string, unknown>,
  result: unknown,
): GhostsigError | null {
  const r = result as Record<string, unknown> | null;
  const str = (k: string) => typeof r?.[k] === "string" && (r[k] as string).length > 0;
  if (
    !r ||
    typeof r !== "object" ||
    !str("address") ||
    !/^[0-9a-f]{64}$/i.test(String(r.publicKey))
  ) {
    return new GhostsigError(
      -1,
      "GHOSTSIG answered without an address and a public key",
      "bad_reply",
    );
  }
  if (method !== "connect" && !str("signature")) {
    return new GhostsigError(-1, "GHOSTSIG answered without a signature", "bad_reply");
  }
  if (method === "sign" && !(str("hash") && str("blob"))) {
    return new GhostsigError(-1, "GHOSTSIG answered without the signed transaction", "bad_reply");
  }
  if (typeof params.address === "string" && params.address !== r.address) {
    return new GhostsigError(
      -1,
      `GHOSTSIG signed as ${String(r.address)}, not as ${params.address}`,
      "account_mismatch",
    );
  }
  return null;
}

/** One request to the page. Never throws: every failure is a rejection with a GhostsigError. */
function ghostsigRequest<T = unknown>(req: GhostsigRequest): Promise<T> {
  const win = typeof window === "undefined" ? undefined : window;
  if (!win || typeof win.open !== "function") {
    return Promise.reject(
      new GhostsigError(-1, "This environment cannot open a popup", "popup_blocked"),
    );
  }
  const page = ghostsigPageUrl(req.url);
  if (page instanceof GhostsigError) return Promise.reject(page);
  const url = page.href;
  const origin = page.origin;
  const params = req.params ?? {};
  const timeoutMs = req.timeoutMs ?? GHOSTSIG_TIMEOUT_MS;

  const held = ghostsigHeld.get(win);
  ghostsigHeld.delete(win);
  const reuse = held !== undefined &&
    !held.popup.closed &&
    held.origin === origin &&
    held.chain === req.chain &&
    held.network === req.network &&
    Date.now() - held.at < GHOSTSIG_REUSE_MS;
  let popup: Window | null;
  if (reuse) {
    popup = held.popup;
  } else {
    // A random window name. A fixed one would let any frame on the app's page take the popup over.
    try {
      popup = win.open(url, `ghostsig-${ghostsigId()}`, ghostsigFeatures(win));
    } catch {
      popup = null;
    }
    if (!popup || popup.closed) {
      return Promise.reject(
        new GhostsigError(
          -1,
          "The browser blocked the GHOSTSIG popup. Allow popups for this site and try again",
          "popup_blocked",
        ),
      );
    }
  }
  const opened = popup;

  const id = ghostsigId();
  const request = {
    ghostsig: GHOSTSIG_PROTOCOL,
    id,
    type: "request",
    method: req.method,
    chain: req.chain,
    network: req.network,
    params,
  };

  return new Promise<T>((resolve, reject) => {
    let done = false;
    let posted = reuse;
    const finish = (err: GhostsigError | null, value?: T) => {
      if (done) return;
      done = true;
      win.removeEventListener("message", onMessage);
      clearInterval(poll);
      clearTimeout(readyTimer);
      clearTimeout(timer);
      // A connect leaves the page open. A failure of the client's own closes the popup;
      // a page that refused keeps it, to show why.
      if (!err && req.method === "connect") {
        ghostsigHeld.set(win, {
          popup: opened,
          origin,
          chain: req.chain,
          network: req.network,
          at: Date.now(),
        });
      } else if (err?.ext) {
        try {
          if (!opened.closed) opened.close();
        } catch {
          // a foreign window
        }
      }
      if (err) reject(err);
      else resolve(value as T);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== opened) return;
      const data = event.data as Record<string, unknown> | null;
      if (!data || typeof data !== "object" || data.ghostsig !== GHOSTSIG_PROTOCOL) return;
      if (data.type === "ready") {
        posted = true;
        opened.postMessage(request, origin);
        return;
      }
      if (data.id !== id) return;
      if (data.type === "result") {
        const bad = ghostsigCheckResult(req.method, params, data.result);
        if (bad) finish(bad);
        else finish(null, data.result as T);
      } else if (data.type === "error") {
        const e = data.error as { code?: unknown; message?: unknown } | undefined;
        const code = ([-1, -2, -3, -4] as const).find((c) => c === e?.code) ?? -1;
        finish(
          new GhostsigError(
            code,
            typeof e?.message === "string" ? e.message : "GHOSTSIG refused the request",
          ),
        );
      }
    };
    win.addEventListener("message", onMessage);
    if (reuse) opened.postMessage(request, origin);
    const poll = setInterval(() => {
      if (opened.closed) {
        finish(
          new GhostsigError(-4, "The GHOSTSIG popup was closed before it answered", "popup_closed"),
        );
      }
    }, 500);
    const readyTimer = setTimeout(
      () => {
        if (!posted) {
          finish(
            new GhostsigError(
              -1,
              "GHOSTSIG did not answer. The popup lost its opener (a Cross-Origin-Opener-Policy of same-origin does that), or the page is not GHOSTSIG",
              "unreachable",
            ),
          );
        }
      },
      Math.min(GHOSTSIG_READY_MS, timeoutMs),
    );
    const timer = setTimeout(
      () => finish(new GhostsigError(-1, "GHOSTSIG did not answer in time", "timeout")),
      timeoutMs,
    );
  });
}
// ghostsig-popup:end
