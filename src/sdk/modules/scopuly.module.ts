import { type IOnChangeEvent, type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

export const SCOPULY_ID = "scopuly";

const SCOPULY_AVAILABILITY_WAIT_MS = 800;

interface ScopulyProviderError {
  code?: number;
  message?: string;
  ext?: string;
}

interface ScopulyProviderOptions {
  networkPassphrase?: string;
  address?: string;
  path?: string;
}

interface ScopulyProviderChange {
  address: string;
  network: string;
  networkPassphrase: string;
}

interface ScopulyProvider {
  isScopuly?: boolean;
  platform?: "mobile" | "extension";
  requestAccess(): Promise<{ address?: string; error?: ScopulyProviderError }>;
  getAddress(): Promise<{ address?: string; error?: ScopulyProviderError }>;
  getPublicKey(): Promise<string>;
  getNetwork(): Promise<{ network: string; networkPassphrase: string; error?: ScopulyProviderError }>;
  signTransaction(
    xdr: string,
    opts?: ScopulyProviderOptions,
  ): Promise<{
    signedTxXdr?: string;
    signedXDR?: string;
    signerAddress?: string;
    error?: ScopulyProviderError;
  }>;
  signAndSubmitTransaction(
    xdr: string,
    opts?: ScopulyProviderOptions,
  ): Promise<{ status: "success" | "pending"; error?: ScopulyProviderError }>;
  signAuthEntry(
    authEntry: string,
    opts?: ScopulyProviderOptions,
  ): Promise<{ signedAuthEntry?: string; signerAddress?: string; error?: ScopulyProviderError }>;
  signMessage(
    message: string,
    opts?: ScopulyProviderOptions,
  ): Promise<{ signedMessage?: string; signerAddress?: string; error?: ScopulyProviderError }>;
  disconnect(): Promise<void>;
  onChange(listener: (event: ScopulyProviderChange) => void): () => void;
}

declare const window:
  & Window
  & typeof globalThis
  & {
    scopuly?: ScopulyProvider;
  };

export class ScopulyModule implements ModuleInterface {
  private removeChangeListener?: () => void;
  private providerInitializedListener?: EventListener;

  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = SCOPULY_ID;
  productName: string = "Scopuly";
  productUrl: string = "https://extension.scopuly.com/";
  productIcon: string = "https://scopuly.com/img/logo/icon.png";

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw {
        code: -3,
        message:
          "Scopuly provider is not available. Install the Scopuly browser extension or open the dApp inside the Scopuly app.",
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    if (this.isProviderReady()) {
      return true;
    }

    return await new Promise<boolean>((resolve) => {
      let settled = false;

      const finish = (available: boolean): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        window.removeEventListener("scopuly#initialized", onInitialized);
        resolve(available);
      };
      const onInitialized = (): void => finish(this.isProviderReady());
      const timer = setTimeout(() => finish(this.isProviderReady()), SCOPULY_AVAILABILITY_WAIT_MS);

      window.addEventListener("scopuly#initialized", onInitialized, { once: true });

      // Guard the gap between the first readiness check and listener registration.
      if (this.isProviderReady()) finish(true);
    });
  }

  async isPlatformWrapper(): Promise<boolean> {
    return this.isProviderReady() && window.scopuly?.platform === "mobile";
  }

  onChange(callback: (event: IOnChangeEvent) => void): void {
    this.removeChangeListener?.();
    this.removeChangeListener = undefined;

    if (typeof window === "undefined") return;

    if (this.providerInitializedListener) {
      window.removeEventListener("scopuly#initialized", this.providerInitializedListener);
      this.providerInitializedListener = undefined;
    }

    const subscribe = () => {
      if (!this.isProviderReady()) return;

      this.removeChangeListener = this.getProvider().onChange((event) => {
        callback({
          address: event.address,
          network: event.network,
          networkPassphrase: event.networkPassphrase,
        });
      });
    };

    if (this.isProviderReady()) {
      subscribe();
      return;
    }

    this.providerInitializedListener = () => {
      this.providerInitializedListener = undefined;
      subscribe();
    };
    window.addEventListener("scopuly#initialized", this.providerInitializedListener, { once: true });
  }

  async getAddress(params?: { skipRequestAccess?: boolean }): Promise<{ address: string }> {
    try {
      await this.runChecks();

      if (params?.skipRequestAccess !== true) {
        const access = await this.getProvider().requestAccess();

        if (access.error) throw access.error;

        if (access.address) {
          return { address: access.address };
        }
      }

      const addressResult = await this.getProvider().getAddress();

      if (addressResult.error) throw addressResult.error;

      if (addressResult.address) {
        return { address: addressResult.address };
      }

      const address = await this.getProvider().getPublicKey();

      if (!address) {
        throw { code: -3, message: "Scopuly returned an empty address." };
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
      await this.runChecks();
      const { signedTxXdr, signedXDR, signerAddress, error } = await this.getProvider().signTransaction(xdr, opts);

      if (error) throw error;

      const signedTransaction = signedTxXdr || signedXDR;
      if (!signedTransaction) {
        throw { code: -3, message: "Scopuly returned an empty signed transaction." };
      }

      return {
        signedTxXdr: signedTransaction,
        signerAddress,
      };
    } catch (e) {
      throw parseError(e);
    }
  }

  async signAndSubmitTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
    },
  ): Promise<{ status: "success" | "pending" }> {
    try {
      await this.runChecks();
      const result = await this.getProvider().signAndSubmitTransaction(xdr, opts);

      if (result.error) throw result.error;

      return { status: result.status };
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
      await this.runChecks();
      const result = await this.getProvider().signAuthEntry(authEntry, opts);

      if (result.error) throw result.error;
      if (!result.signedAuthEntry) {
        throw { code: -3, message: "Scopuly returned an empty signed auth entry." };
      }

      return {
        signedAuthEntry: result.signedAuthEntry,
        signerAddress: result.signerAddress,
      };
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
      await this.runChecks();
      const result = await this.getProvider().signMessage(message, opts);

      if (result.error) throw result.error;
      if (!result.signedMessage) {
        throw { code: -3, message: "Scopuly returned an empty signed message." };
      }

      return {
        signedMessage: result.signedMessage,
        signerAddress: result.signerAddress,
      };
    } catch (e) {
      throw parseError(e);
    }
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    try {
      await this.runChecks();
      const { network, networkPassphrase, error } = await this.getProvider().getNetwork();

      if (error) throw error;

      return { network, networkPassphrase };
    } catch (e) {
      throw parseError(e);
    }
  }

  async disconnect(): Promise<void> {
    await this.getProvider().disconnect();
  }

  private getProvider(): ScopulyProvider {
    if (typeof window === "undefined" || !window.scopuly) {
      throw {
        code: -3,
        message:
          "Scopuly provider is not available. Install the Scopuly browser extension or open the dApp inside the Scopuly app.",
      };
    }

    return window.scopuly;
  }

  private isProviderReady(): boolean {
    if (typeof window === "undefined" || window.scopuly?.isScopuly !== true) {
      return false;
    }

    return window.scopuly.platform === "mobile" || window.scopuly.platform === "extension";
  }
}
