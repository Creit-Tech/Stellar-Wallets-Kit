/**
 * Veil module for the Stellar Wallets Kit.
 *
 * Veil (https://useveilapp.xyz) is a passkey-powered smart wallet for Stellar.
 * When running inside Veil's in-app dApp browser, the module detects the injected
 * provider on `window.veil`. Outside of Veil's browser (e.g. desktop or mobile
 * web), it falls back to a hosted popup client communicating over postMessage with
 * https://wallet.useveilapp.xyz.
 *
 * Conforms to SEP-43 and ModuleInterface with zero configuration and zero polyfills.
 */

import { type ModuleInterface, ModuleType, Networks } from "../../types/mod.ts";

export const VEIL_ID = "veil";

export interface VeilProvider {
  getAddress(): Promise<{ address: string }>;
  signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }>;
  signAuthEntry(
    authEntry: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }>;
  signMessage?(
    message: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedMessage: string; signerAddress?: string }>;
  signAndSubmitTransaction?(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string },
  ): Promise<{ status: "success" | "pending" }>;
  getNetwork?(): Promise<{ network: string; networkPassphrase: string }>;
}

declare global {
  interface Window {
    veil?: VeilProvider;
  }
}

interface VeilSignature extends VeilConnectResult {
  signature: string;
}

/** The page's `submitted.kind` for a transaction it never sent. */
const VEIL_UNSENT = ["offline", "unsent", "locked", "moved", "handOver"];

/** The page's network identifier and SEP-43 name for supported Stellar networks. */
const VEIL_NETWORKS: Record<string, { id: string; name: string }> = {
  [Networks.PUBLIC]: { id: "mainnet", name: "PUBLIC" },
  [Networks.TESTNET]: { id: "testnet", name: "TESTNET" },
  [Networks.FUTURENET]: { id: "futurenet", name: "FUTURENET" },
};

export class VeilModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = VEIL_ID;
  productName: string = "Veil";
  productUrl: string = "https://useveilapp.xyz";
  productIcon: string = VEIL_ICON;

  private address: string | null = null;
  private passphrase: string = Networks.PUBLIC;
  /** Where the popup page is and how long it may take. */
  private readonly page: { url?: string; timeoutMs?: number };

  constructor(params: { network?: Networks | string; url?: string; timeoutMs?: number } = {}) {
    const { network, ...page } = params;
    if (network) this.passphrase = network;
    this.page = page;
  }

  /**
   * Available if the injected provider is present on `window.veil` (in-app dApp browser)
   * or if popup window opening is supported (regular browser).
   */
  async isAvailable(): Promise<boolean> {
    const win = typeof globalThis.window !== "undefined" ? globalThis.window : undefined;
    if (!win) return false;
    if (win.veil && typeof win.veil.getAddress === "function") return true;
    return typeof win.open === "function";
  }

  /**
   * Returns true if running inside Veil's in-app browser wrapper.
   */
  async isPlatformWrapper(): Promise<boolean> {
    const win = typeof globalThis.window !== "undefined" ? globalThis.window : undefined;
    return Boolean(win?.veil && typeof win.veil.getAddress === "function");
  }

  async getAddress(): Promise<{ address: string }> {
    const injected = this.getInjected();
    if (injected) {
      const res = await injected.getAddress();
      this.address = res.address;
      return { address: res.address };
    }

    const result = await this.request<VeilConnectResult>("connect", {}, undefined);
    this.address = result.address;
    return { address: result.address };
  }

  async signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    const passphrase = opts?.networkPassphrase ?? this.passphrase;
    const injected = this.getInjected();
    if (injected) {
      const res = await injected.signTransaction(xdr, { ...opts, networkPassphrase: passphrase });
      this.network(passphrase);
      return res;
    }

    const params = { payload: xdr, submit: false, address: this.signer(opts) };
    const result = await this.request<VeilSignResult>("sign", params, passphrase);
    return { signedTxXdr: result.blob, signerAddress: result.address };
  }

  async signAuthEntry(
    authEntry: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    const passphrase = opts?.networkPassphrase ?? this.passphrase;
    const injected = this.getInjected();
    if (injected) {
      const res = await injected.signAuthEntry(authEntry, { ...opts, networkPassphrase: passphrase });
      this.network(passphrase);
      return res;
    }

    const params = { payload: authEntry, address: this.signer(opts) };
    const result = await this.request<VeilSignature>("signAuthEntry", params, passphrase);
    return { signedAuthEntry: result.signature, signerAddress: result.address };
  }

  async signMessage(
    message: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    const passphrase = opts?.networkPassphrase ?? this.passphrase;
    const injected = this.getInjected();
    if (injected && injected.signMessage) {
      const res = await injected.signMessage(message, { ...opts, networkPassphrase: passphrase });
      this.network(passphrase);
      return res;
    }

    const params = { message, address: this.signer(opts) };
    const result = await this.request<VeilSignature>("signMessage", params, passphrase);
    return { signedMessage: result.signature, signerAddress: result.address };
  }

  async signAndSubmitTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string },
  ): Promise<{ status: "success" | "pending" }> {
    const passphrase = opts?.networkPassphrase ?? this.passphrase;
    const injected = this.getInjected();
    if (injected && injected.signAndSubmitTransaction) {
      const res = await injected.signAndSubmitTransaction(xdr, { ...opts, networkPassphrase: passphrase });
      this.network(passphrase);
      return res;
    }

    const params = { payload: xdr, submit: true, address: this.signer(opts) };
    const result = await this.request<VeilSignResult>("sign", params, passphrase);
    const { handOver, submitted, hash } = result;
    if (handOver || (submitted && VEIL_UNSENT.includes(submitted.kind))) {
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
    const injected = this.getInjected();
    if (injected && injected.getNetwork) {
      return await injected.getNetwork();
    }
    return { network: this.network().name, networkPassphrase: this.passphrase };
  }

  async disconnect(): Promise<void> {
    this.address = null;
  }

  private getInjected(): VeilProvider | null {
    const win = typeof globalThis.window !== "undefined" ? globalThis.window : undefined;
    if (win?.veil && typeof win.veil.getAddress === "function") {
      return win.veil;
    }
    return null;
  }

  private signer(opts?: { address?: string }): string | undefined {
    return opts?.address ?? this.address ?? undefined;
  }

  /** The network a call names, which becomes the module's, or the module's own. */
  private network(passphrase?: string): { id: string; name: string } {
    const asked = passphrase || this.passphrase;
    const network = VEIL_NETWORKS[asked];
    if (!network) throw { code: -3, message: `Veil does not know the network "${asked}"` };
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
      return await veilRequest<T>({ chain: "stellar", network: id, method, params, ...this.page });
    } catch (e) {
      if (e instanceof VeilError) throw { code: e.code, message: e.message, ext: e.ext };
      throw { code: -1, message: e instanceof Error ? e.message : String(e) };
    }
  }
}

// veil-icon:begin
const VEIL_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5NiA5NiIgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlZlaWwiPgogIDxyZWN0IHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgcng9IjIyIiBmaWxsPSIjMEYwRjBGIi8+CiAgPHJlY3QgeD0iMjIiIHk9IjI2IiB3aWR0aD0iNTIiIGhlaWdodD0iMTIiIHJ4PSI2IiBmaWxsPSIjRkREQTI0Ii8+CiAgPHJlY3QgeD0iMjgiIHk9IjQ0IiB3aWR0aD0iNDAiIGhlaWdodD0iMTIiIHJ4PSI2IiBmaWxsPSIjRkREQTI0IiBvcGFjaXR5PSIwLjYyIi8+CiAgPHJlY3QgeD0iMzQiIHk9IjYyIiB3aWR0aD0iMjgiIGhlaWdodD0iMTIiIHJ4PSI2IiBmaWxsPSIjRkREQTI0IiBvcGFjaXR5PSIwLjM0Ii8+Cjwvc3ZnPgo=";
// veil-icon:end

// veil-popup:begin
const VEIL_PROTOCOL = 1;
/** The page the client opens, unless a request names an alternate URL. */
const VEIL_URL = "https://wallet.useveilapp.xyz/?connect";
/** How long a connect's popup is reused. */
const VEIL_REUSE_MS = 1_500;
const VEIL_READY_MS = 10_000;
const VEIL_TIMEOUT_MS = 60_000;

/** SEP-43 codes: -1 internal, -2 external service, -3 bad request or unsupported, -4 rejected. */
type VeilCode = -1 | -2 | -3 | -4;

type VeilExt =
  | "popup_blocked"
  | "popup_closed"
  | "timeout"
  | "unreachable"
  | "account_mismatch"
  | "bad_reply";

export class VeilError extends Error {
  readonly code: VeilCode;
  readonly ext?: VeilExt;
  constructor(code: VeilCode, message: string, ext?: VeilExt) {
    super(message);
    this.name = "VeilError";
    this.code = code;
    if (ext) this.ext = ext;
  }
}

interface VeilConnectResult {
  address: string;
  publicKey?: string;
}

interface VeilSubmitted {
  kind: string;
  code?: string;
  ledger?: number | string;
  ok?: boolean;
}

interface VeilSignResult extends VeilConnectResult {
  hash: string;
  blob: string;
  signature: string;
  handOver?: string;
  submitted?: VeilSubmitted;
}

interface VeilRequest {
  chain: string;
  network: string;
  method: string;
  params?: Record<string, unknown>;
  url?: string;
  timeoutMs?: number;
}

const veilHeld = new WeakMap<
  Window,
  { popup: Window; origin: string; chain: string; network: string; at: number }
>();

function veilPageUrl(url: string | undefined): URL | VeilError {
  let parsed: URL;
  try {
    parsed = new URL(url ?? VEIL_URL);
  } catch {
    return new VeilError(-3, `"${String(url)}" is not a URL`);
  }
  const defaultUrl = new URL(VEIL_URL);
  if (parsed.origin === defaultUrl.origin) return parsed;
  if (parsed.origin === "https://useveilapp.xyz") return parsed;
  if (parsed.hostname === "localhost" && parsed.protocol === "http:") return parsed;
  return new VeilError(
    -3,
    `Veil is at ${defaultUrl.origin}. A copy at ${parsed.origin} is not opened`,
  );
}

function veilFeatures(win: Window): string {
  const width = 420;
  const height = 720;
  const outerW = win.outerWidth || win.screen?.width || width;
  const outerH = win.outerHeight || win.screen?.height || height;
  const left = Math.max(0, Math.round((win.screenX || 0) + (outerW - width) / 2));
  const top = Math.max(0, Math.round((win.screenY || 0) + (outerH - height) / 2));
  return `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
}

function veilId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function veilCheckResult(
  method: string,
  params: Record<string, unknown>,
  result: unknown,
): VeilError | null {
  const r = result as Record<string, unknown> | null;
  const str = (k: string) => typeof r?.[k] === "string" && (r[k] as string).length > 0;
  if (!r || typeof r !== "object" || !str("address")) {
    return new VeilError(
      -1,
      "Veil answered without an address",
      "bad_reply",
    );
  }
  if (method !== "connect" && !str("signature")) {
    return new VeilError(-1, "Veil answered without a signature", "bad_reply");
  }
  if (method === "sign" && !(str("hash") && str("blob"))) {
    return new VeilError(-1, "Veil answered without the signed transaction", "bad_reply");
  }
  if (typeof params.address === "string" && params.address !== r.address) {
    return new VeilError(
      -1,
      `Veil signed as ${String(r.address)}, not as ${params.address}`,
      "account_mismatch",
    );
  }
  return null;
}

function veilRequest<T = unknown>(req: VeilRequest): Promise<T> {
  const win = typeof window === "undefined" ? undefined : window;
  if (!win || typeof win.open !== "function") {
    return Promise.reject(
      new VeilError(-1, "This environment cannot open a popup", "popup_blocked"),
    );
  }
  const page = veilPageUrl(req.url);
  if (page instanceof VeilError) return Promise.reject(page);
  const url = page.href;
  const origin = page.origin;
  const params = req.params ?? {};
  const timeoutMs = req.timeoutMs ?? VEIL_TIMEOUT_MS;

  const held = veilHeld.get(win);
  veilHeld.delete(win);
  const reuse = held !== undefined &&
    !held.popup.closed &&
    held.origin === origin &&
    held.chain === req.chain &&
    held.network === req.network &&
    Date.now() - held.at < VEIL_REUSE_MS;
  let popup: Window | null;
  if (reuse) {
    popup = held.popup;
  } else {
    try {
      popup = win.open(url, `veil-${veilId()}`, veilFeatures(win));
    } catch {
      popup = null;
    }
    if (!popup || popup.closed) {
      return Promise.reject(
        new VeilError(
          -1,
          "The browser blocked the Veil popup. Allow popups for this site and try again",
          "popup_blocked",
        ),
      );
    }
  }
  const opened = popup;

  const id = veilId();
  const request = {
    veil: VEIL_PROTOCOL,
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
    const finish = (err: VeilError | null, value?: T) => {
      if (done) return;
      done = true;
      win.removeEventListener("message", onMessage);
      clearInterval(poll);
      clearTimeout(readyTimer);
      clearTimeout(timer);
      if (!err && req.method === "connect") {
        veilHeld.set(win, {
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
          // foreign window
        }
      }
      if (err) reject(err);
      else resolve(value as T);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== opened) return;
      const data = event.data as Record<string, unknown> | null;
      if (!data || typeof data !== "object" || data.veil !== VEIL_PROTOCOL) return;
      if (data.type === "ready") {
        posted = true;
        opened.postMessage(request, origin);
        return;
      }
      if (data.id !== id) return;
      if (data.type === "result") {
        const bad = veilCheckResult(req.method, params, data.result);
        if (bad) finish(bad);
        else finish(null, data.result as T);
      } else if (data.type === "error") {
        const e = data.error as { code?: unknown; message?: unknown } | undefined;
        const code = ([-1, -2, -3, -4] as const).find((c) => c === e?.code) ?? -1;
        finish(
          new VeilError(
            code,
            typeof e?.message === "string" ? e.message : "Veil refused the request",
          ),
        );
      }
    };
    win.addEventListener("message", onMessage);
    if (reuse) opened.postMessage(request, origin);
    const poll = setInterval(() => {
      if (opened.closed) {
        finish(
          new VeilError(-4, "The Veil popup was closed before it answered", "popup_closed"),
        );
      }
    }, 500);
    const readyTimer = setTimeout(
      () => {
        if (!posted) {
          finish(
            new VeilError(
              -1,
              "Veil did not answer. The popup lost its opener (a Cross-Origin-Opener-Policy of same-origin does that), or the page is not Veil",
              "unreachable",
            ),
          );
        }
      },
      Math.min(VEIL_READY_MS, timeoutMs),
    );
    const timer = setTimeout(
      () => finish(new VeilError(-1, "Veil did not answer in time", "timeout")),
      timeoutMs,
    );
  });
}
// veil-popup:end
