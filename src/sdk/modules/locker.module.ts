import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

/**
 * Locker Wallet (https://lockerprotocol.com) is a browser extension for Chrome, Brave and Firefox whose keys never sit
 * in the browser: each request is shown as a QR code, checked and signed on Locker Vault, an app on an offline phone,
 * and the signature comes back through the camera.
 *
 * On every page, before the page's own scripts run, the extension defines `window.lockerStellar`: a SEP-43 provider
 * (`getAddress`, `getNetwork`, `signTransaction`, `signAuthEntry`, `signMessage`) marked `isLocker: true`. Its methods
 * reject with `{ code, message }` (4001 when the user refuses on the Vault).
 */

interface LockerSignOptions {
  networkPassphrase?: string;
  address?: string;
}

interface LockerStellarProvider {
  isLocker?: boolean;
  getAddress(): Promise<{ address: string }>;
  getNetwork(): Promise<{ network: string; networkPassphrase: string }>;
  signTransaction(xdr: string, opts?: LockerSignOptions): Promise<{ signedTxXdr: string; signerAddress?: string }>;
  signAuthEntry(
    authEntry: string,
    opts?: LockerSignOptions,
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }>;
  signMessage(message: string, opts?: LockerSignOptions): Promise<{ signedMessage: string; signerAddress?: string }>;
}

declare const window:
  & Window
  & typeof globalThis
  & {
    lockerStellar?: LockerStellarProvider;
  };

export const LOCKER_ID: string = "locker";

const NOT_INSTALLED = {
  code: -3,
  message: "Locker Wallet is not installed. Get it at https://lockerprotocol.com",
};

export class LockerModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.AIR_GAPED_WALLET;

  productId: string = LOCKER_ID;
  productName: string = "Locker Wallet";
  productUrl: string = "https://lockerprotocol.com";
  // Locker Protocol logo (96 by 96 SVG, the one the extension announces through EIP-6963 and Wallet Standard)
  productIcon: string =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMD"
    + "AgMTAwIiB3aWR0aD0iOTYiIGhlaWdodD0iOTYiPgo8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcn"
    + "g9IjIyIiBmaWxsPSIjZmZmZmZmIi8+CjxwYXRoIGQ9Ik0gMzUgMTUgSCAxNSBWIDM1IE0gNjUgMTUgSCA4NSBWIDM1IE0gMzUgOD"
    + "UgSCAxNSBWIDY1IE0gNjUgODUgSCA4NSBWIDY1IiBmaWxsPSJub25lIiBzdHJva2U9IiMxRTI5M0IiIHN0cm9rZS13aWR0aD0iNC"
    + "Igc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0gMzUgMTUgSCAxNSBWID"
    + "M1IE0gNjUgMTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk5MDBDQyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm"
    + "91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTSA2NSA4NSBIIDg1IFYgNjUiIGZpbGw9Im5vbmUiIHN0cm"
    + "9rZT0iIzk5MDBDQyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bm"
    + "QiLz4KPHBhdGggZD0iTSAzMCAzMCBWIDY5IiBmaWxsPSJub25lIiBzdHJva2U9IiMxRTI5M0IiIHN0cm9rZS13aWR0aD0iNCIgc3"
    + "Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0gNDAgMjIgViA3OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTkwMENDIi"
    + "BzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNIDUwIDIyIFYgNzgiIGZpbGw9Im5vbm"
    + "UiIHN0cm9rZT0iIzFFMjkzQiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTSA2MC"
    + "AyMiBWIDc4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTAwQ0MiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW"
    + "5kIi8+CjxwYXRoIGQ9Ik0gNzAgMzAgViA2OSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMUUyOTNCIiBzdHJva2Utd2lkdGg9IjQiIH"
    + "N0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=";

  async isAvailable(): Promise<boolean> {
    return typeof window !== "undefined" && window.lockerStellar?.isLocker === true;
  }

  /**
   * The first call on a site asks the user to connect it (on the extension); once the site is connected, the address
   * comes back without a prompt. Locker Wallet has no silent read before that, so `skipRequestAccess` changes nothing.
   */
  async getAddress(): Promise<{ address: string }> {
    try {
      const { address } = await this.provider().getAddress();
      if (!address) throw { code: -3, message: "Locker Wallet returned no address." };
      return { address };
    } catch (e) {
      throw parseError(e);
    }
  }

  async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    try {
      const { signedTxXdr, signerAddress } = await this.provider().signTransaction(xdr, this.signOptions(opts));
      if (!signedTxXdr) throw { code: -3, message: "Locker Wallet returned an empty signed transaction." };
      return { signedTxXdr, signerAddress };
    } catch (e) {
      throw parseError(e);
    }
  }

  async signAuthEntry(
    authEntry: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    try {
      const { signedAuthEntry, signerAddress } = await this.provider().signAuthEntry(authEntry, this.signOptions(opts));
      if (!signedAuthEntry) throw { code: -3, message: "Locker Wallet returned an empty signed auth entry." };
      return { signedAuthEntry, signerAddress };
    } catch (e) {
      throw parseError(e);
    }
  }

  async signMessage(
    message: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    try {
      const { signedMessage, signerAddress } = await this.provider().signMessage(message, this.signOptions(opts));
      if (!signedMessage) throw { code: -3, message: "Locker Wallet returned an empty signed message." };
      return { signedMessage, signerAddress };
    } catch (e) {
      throw parseError(e);
    }
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    try {
      const { network, networkPassphrase } = await this.provider().getNetwork();
      return { network, networkPassphrase };
    } catch (e) {
      throw parseError(e);
    }
  }

  /** The SEP-43 options Locker Wallet reads; `path` is for hardware wallets and has no meaning here. */
  private signOptions(opts?: { networkPassphrase?: string; address?: string }): LockerSignOptions {
    const out: LockerSignOptions = {};
    if (opts?.networkPassphrase) out.networkPassphrase = opts.networkPassphrase;
    if (opts?.address) out.address = opts.address;
    return out;
  }

  private provider(): LockerStellarProvider {
    if (typeof window === "undefined" || window.lockerStellar?.isLocker !== true) {
      throw NOT_INSTALLED;
    }
    return window.lockerStellar;
  }
}
