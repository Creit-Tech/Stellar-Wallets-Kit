import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

/**
 * D'CENT exposes a Freighter/SEP-43-compatible provider on the `window` object
 * when a dApp is opened inside one of its clients:
 *  - the D'CENT browser extension (`window.stellar.platform === "extension"`)
 *  - the D'CENT mobile in-app dApp browser (`window.stellar.platform === "mobile"`)
 *
 * Both clients inject a frozen detection sentinel `window.stellar` (with
 * `provider === "dcent"`) and the provider instance as `window.dcentStellarProvider`.
 * The provider follows a "never-throw" convention: its methods resolve with a
 * `{ ..., error? }` shape instead of throwing, so this module unwraps `error`
 * into a rejected promise to match the kit's throw-on-failure contract.
 *
 * The module talks to `window.dcentStellarProvider` directly (rather than through
 * `@stellar/freighter-api`) so it always targets D'CENT specifically — even when
 * the real Freighter extension is also installed — and stays dependency-free.
 */

interface DcentApiError {
  code?: number;
  message?: string;
  ext?: string;
}

interface DcentSignOpts {
  networkPassphrase?: string;
  address?: string;
  accountToSign?: string;
}

interface DcentStellarProvider {
  isConnected(): Promise<{ isConnected: boolean }>;
  requestAccess(): Promise<{ address: string; publicKey?: string; error?: DcentApiError }>;
  getAddress(): Promise<{ address: string; error?: DcentApiError }>;
  signTransaction(
    xdr: string,
    opts?: DcentSignOpts,
  ): Promise<{ signedTxXdr: string; signerAddress?: string; error?: DcentApiError }>;
  signAuthEntry(
    authEntry: string,
    opts?: DcentSignOpts,
  ): Promise<{ signedAuthEntry: string; signerAddress?: string; error?: DcentApiError }>;
  signMessage(
    message: string,
    opts?: DcentSignOpts,
  ): Promise<{ signedMessage: string; signerAddress?: string; error?: DcentApiError }>;
  getNetwork(): Promise<{ network: string; networkPassphrase: string; error?: DcentApiError }>;
}

declare const window:
  & Window
  & typeof globalThis
  & {
    stellar?: {
      provider: string;
      platform: string;
      version: string;
    };
    dcentStellarProvider?: DcentStellarProvider;
  };

export const DCENT_ID: string = "dcent";

/**
 * Max time isAvailable() waits for the provider injection sentinel to appear before
 * reporting unavailable. Kept under the kit's 1000ms isAvailable budget (see
 * ModuleInterface.isAvailable) so a cold-load injection race resolves to "available"
 * rather than a spurious "unavailable".
 */
const DCENT_AVAILABILITY_WAIT_MS = 800;

export class DcentModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = DCENT_ID;
  productName: string = "D'CENT Wallet";
  productUrl: string = "https://dcentwallet.com";
  productIcon: string = "https://assets.dcentwallet.com/images/dcent-symbol.svg";

  private getProvider(): DcentStellarProvider {
    const provider = window.dcentStellarProvider;
    if (!provider) {
      throw parseError({ code: -1, message: "D'CENT Stellar provider is not available" });
    }
    return provider;
  }

  async isAvailable(): Promise<boolean> {
    // Detection sentinel injected by both the D'CENT extension (document_start) and the
    // mobile in-app browser. The in-app browser fetches its provider engine remotely and
    // may inject it on a post-load fallback, so on a cold load the sentinel can be absent
    // when SWK first evaluates the wallet list. Wait briefly for the `dcent#initialized`
    // event the provider dispatches on injection instead of reporting unavailable.
    if (this.isSentinelReady()) return this.connected();

    const appeared: boolean = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), DCENT_AVAILABILITY_WAIT_MS);
      const onReady = (): void => {
        clearTimeout(timer);
        resolve(true);
      };
      window.addEventListener("dcent#initialized", onReady, { once: true });
      // Guard the gap between the check above and attaching the listener: if the provider
      // was injected in between, the event already fired and would otherwise be missed.
      if (this.isSentinelReady()) {
        clearTimeout(timer);
        window.removeEventListener("dcent#initialized", onReady);
        resolve(true);
      }
    });

    return appeared && this.isSentinelReady() ? this.connected() : false;
  }

  private isSentinelReady(): boolean {
    return window.stellar?.provider === "dcent" && !!window.dcentStellarProvider;
  }

  private async connected(): Promise<boolean> {
    try {
      const { isConnected } = await this.getProvider().isConnected();
      return isConnected;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // Returns true when the dApp is running inside D'CENT's own mobile in-app browser,
  // so the kit can auto-select D'CENT instead of prompting the user.
  isPlatformWrapper(): Promise<boolean> {
    return Promise.resolve(window.stellar?.provider === "dcent" && window.stellar?.platform === "mobile");
  }

  async getAddress(params?: { path?: string; skipRequestAccess?: boolean }): Promise<{ address: string }> {
    try {
      const provider = this.getProvider();

      // requestAccess is a best-effort permission step: on the extension it prompts the user,
      // but some D'CENT clients (e.g. the mobile in-app browser) don't implement
      // `stellar_requestAccess` and expose the active account directly via getAddress().
      // So a requestAccess failure must NOT be fatal — getAddress() below is the source of
      // truth (it still errors when the user has not granted access on the extension).
      if (params?.skipRequestAccess !== true) {
        await provider.requestAccess().catch((): undefined => undefined);
      }

      const { address, error } = await provider.getAddress();
      if (error) return Promise.reject(parseError(error));
      if (!address) {
        return Promise.reject({
          code: -3,
          message: "Getting the address from D'CENT is not allowed, please request access first.",
        });
      }

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
      const { signedTxXdr, signerAddress, error } = await this.getProvider().signTransaction(xdr, {
        address: opts?.address,
        networkPassphrase: opts?.networkPassphrase,
      });

      if (error) return Promise.reject(parseError(error));

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
      const { signedAuthEntry, signerAddress, error } = await this.getProvider().signAuthEntry(authEntry, {
        address: opts?.address,
        networkPassphrase: opts?.networkPassphrase,
      });

      if (error) return Promise.reject(parseError(error));
      if (!signedAuthEntry) {
        return Promise.reject({
          code: -3,
          message: "signedAuthEntry returned from D'CENT is undefined.",
        });
      }

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
      const { signedMessage, signerAddress, error } = await this.getProvider().signMessage(message, {
        address: opts?.address,
        networkPassphrase: opts?.networkPassphrase,
      });

      if (error) return Promise.reject(parseError(error));
      if (!signedMessage) {
        return Promise.reject({
          code: -3,
          message: "signedMessage returned from D'CENT is undefined.",
        });
      }

      return { signedMessage, signerAddress };
    } catch (e) {
      throw parseError(e);
    }
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    try {
      const { network, networkPassphrase, error } = await this.getProvider().getNetwork();

      if (error) return Promise.reject(parseError(error));

      return { network, networkPassphrase };
    } catch (e) {
      throw parseError(e);
    }
  }
}
