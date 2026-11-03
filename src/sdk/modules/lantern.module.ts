import { type IKitError, type IOnChangeEvent, type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

/**
 * Lantern is a Stellar wallet that scans and explains every transaction before the user signs it.
 * Its Chrome extension injects `window.lantern` into every https page (top frame only) before the page's scripts run.
 *
 * - Every request opens Lantern's own approval window.
 * - Signing is sign-only: Lantern returns the signed XDR and never submits it.
 * - Testnet only for now. `signAuthEntry` and `signMessage` reject with Lantern's `unsupported` code.
 *
 * Docs: https://golantern.xyz/docs/reference/connect/
 */

/**
 * Lantern rejects with a `LanternError`, whose `code` is a string: `user_rejected`, `not_allowed`, `account_mismatch`,
 * `network_mismatch`, `invalid_request`, `unsupported`, `busy`, `timeout`, `connection_lost` or `internal`.
 */
interface LanternError {
  code?: string;
  message?: string;
}

interface LanternSignOpts {
  networkPassphrase?: string;
  address?: string;
}

interface LanternProvider {
  isLantern: true;
  apiVersion: number;
  isConnected(): Promise<{ isConnected: boolean; apiVersion?: number }>;
  requestAccess(): Promise<{ address: string }>;
  getAddress(): Promise<{ address: string }>;
  getNetwork(): Promise<{ network: string; networkPassphrase: string }>;
  signTransaction(xdr: string, opts?: LanternSignOpts): Promise<{ signedTxXdr: string; signerAddress: string }>;
  signAuthEntry(
    authEntry: string,
    opts?: LanternSignOpts,
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }>;
  signMessage(message: string, opts?: LanternSignOpts): Promise<{ signedMessage: string; signerAddress?: string }>;
  on(event: "change", cb: (data: { reason: string }) => void): void;
  off(event: "change", cb: (data: { reason: string }) => void): void;
}

declare const window:
  & Window
  & typeof globalThis
  & {
    lantern?: LanternProvider;
  };

export const LANTERN_ID: string = "lantern";

/**
 * Lantern's error codes mapped to the kit's numeric codes: -4 the user declined, -3 not allowed, -1 anything else.
 * Lantern's own code is kept in `ext` so a dApp can be precise (for example `network_mismatch`).
 */
function toKitCode(lanternCode: string): number {
  switch (lanternCode) {
    case "user_rejected":
      return -4;
    case "not_allowed":
    case "account_mismatch":
      return -3;
    default:
      return -1;
  }
}

export function parseLanternError(e: any): IKitError {
  const lanternError: LanternError | undefined = e;
  if (typeof lanternError?.code !== "string") return parseError(e);

  return {
    code: toKitCode(lanternError.code),
    message: lanternError.message || "Unhandled error from Lantern",
    ext: lanternError.code,
  };
}

export class LanternModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = LANTERN_ID;
  productName: string = "Lantern";
  productUrl: string = "https://golantern.xyz";
  productIcon: string = "https://golantern.xyz/wallet-icon.png";

  private changeListener?: () => void;

  private getLantern(): LanternProvider | undefined {
    if (typeof window === "undefined") return undefined;
    return window.lantern?.isLantern === true ? window.lantern : undefined;
  }

  private getProvider(): LanternProvider {
    const provider: LanternProvider | undefined = this.getLantern();
    if (!provider) {
      throw parseError({ code: -1, message: "Lantern is not installed" });
    }
    return provider;
  }

  async isAvailable(): Promise<boolean> {
    const provider: LanternProvider | undefined = this.getLantern();
    if (!provider) return false;

    try {
      const { isConnected } = await provider.isConnected();
      return isConnected === true;
    } catch {
      return false;
    }
  }

  /**
   * Called with the account and network whenever Lantern reports a change (account, network, or the site was
   * disconnected). After a disconnect the event carries the error instead.
   */
  onChange(callback: (event: IOnChangeEvent) => void): void {
    const provider: LanternProvider | undefined = this.getLantern();
    if (!provider) return;

    if (this.changeListener) provider.off("change", this.changeListener);

    this.changeListener = (): void => {
      Promise.all([provider.getAddress(), provider.getNetwork()])
        .then(([{ address }, { network, networkPassphrase }]) => callback({ address, network, networkPassphrase }))
        .catch((e) => callback({ address: "", network: "", networkPassphrase: "", error: parseLanternError(e) }));
    };
    provider.on("change", this.changeListener);
  }

  /**
   * Without `skipRequestAccess` this asks the user to connect the site (in Lantern's window). It answers at once if the
   * site is already connected for the current account and network.
   */
  async getAddress(params?: { skipRequestAccess?: boolean }): Promise<{ address: string }> {
    try {
      const provider: LanternProvider = this.getProvider();
      const { address } = params?.skipRequestAccess === true
        ? await provider.getAddress()
        : await provider.requestAccess();
      return { address };
    } catch (e) {
      throw parseLanternError(e);
    }
  }

  /**
   * Lantern scans and explains the transaction in its own window, signs it, and returns it.
   * It never submits the transaction, so `submit: true` is refused.
   */
  async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
      submit?: boolean;
      submitUrl?: string;
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    if (opts?.submit) {
      throw {
        code: -1,
        message: "Lantern signs only. Submit the signed transaction yourself.",
        ext: "unsupported",
      };
    }

    try {
      const signOpts: LanternSignOpts = {};
      if (opts?.networkPassphrase) signOpts.networkPassphrase = opts.networkPassphrase;
      if (opts?.address) signOpts.address = opts.address;

      const { signedTxXdr, signerAddress } = await this.getProvider().signTransaction(xdr, signOpts);
      return { signedTxXdr, signerAddress };
    } catch (e) {
      throw parseLanternError(e);
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
      const { signedAuthEntry, signerAddress } = await this.getProvider().signAuthEntry(authEntry, {
        networkPassphrase: opts?.networkPassphrase,
        address: opts?.address,
      });
      return { signedAuthEntry, signerAddress };
    } catch (e) {
      throw parseLanternError(e);
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
      const { signedMessage, signerAddress } = await this.getProvider().signMessage(message, {
        networkPassphrase: opts?.networkPassphrase,
        address: opts?.address,
      });
      return { signedMessage, signerAddress };
    } catch (e) {
      throw parseLanternError(e);
    }
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    try {
      const { network, networkPassphrase } = await this.getProvider().getNetwork();
      return { network, networkPassphrase };
    } catch (e) {
      throw parseLanternError(e);
    }
  }
}
