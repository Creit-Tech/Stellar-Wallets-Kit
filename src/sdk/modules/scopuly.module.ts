import {
  disconnect,
  getAddress,
  getNetwork,
  getPublicKey,
  onChange as onProviderChange,
  requestAccess,
  signAndSubmitTransaction,
  signAuthEntry,
  signMessage,
  signTransaction,
} from "@scopuly/signer-extension-api";
import { type IOnChangeEvent, type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

export const SCOPULY_ID = "scopuly";

declare const window:
  & Window
  & typeof globalThis
  & {
    scopuly?: {
      isScopuly?: boolean;
      platform?: string;
    };
  };

export class ScopulyModule implements ModuleInterface {
  private removeChangeListener?: () => void;
  private providerInitializedListener?: EventListener;

  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = SCOPULY_ID;
  productName: string = "Scopuly";
  productUrl: string = "https://scopuly.com";
  productIcon: string = "https://scopuly.com/img/logo/icon.png";

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error("Scopuly provider is not available. Open the dApp inside Scopuly mobile app.");
    }
  }

  async isAvailable(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    return window.scopuly?.isScopuly === true && window.scopuly?.platform === "mobile";
  }

  async isPlatformWrapper(): Promise<boolean> {
    return this.isAvailable();
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
      this.removeChangeListener = onProviderChange((event) => {
        callback({
          address: event.address,
          network: event.network,
          networkPassphrase: event.networkPassphrase,
        });
      });
    };

    if (window.scopuly?.isScopuly === true) {
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
        const access = await requestAccess();

        if (access.error) throw access.error;

        if (access.address) {
          return { address: access.address };
        }
      }

      const addressResult = await getAddress();

      if (addressResult.error) throw addressResult.error;

      if (addressResult.address) {
        return { address: addressResult.address };
      }

      const address = await getPublicKey();
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
      const { signedTxXdr, signedXDR, signerAddress, error } = await signTransaction(xdr, opts);

      if (error) throw error;

      return {
        signedTxXdr: signedTxXdr || signedXDR || "",
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
  ): Promise<{ status: "success" | "pending"; hash?: string }> {
    try {
      await this.runChecks();
      const result = await signAndSubmitTransaction(xdr, opts);

      if (result.error) throw result.error;

      return { status: result.status, hash: result.hash };
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
      const result = await signAuthEntry(authEntry, opts);

      if (result.error) throw result.error;

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
      const result = await signMessage(message, opts);

      if (result.error) throw result.error;

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
      const { network, networkPassphrase, error } = await getNetwork();

      if (error) throw error;

      return { network, networkPassphrase };
    } catch (e) {
      throw parseError(e);
    }
  }

  async disconnect(): Promise<void> {
    await disconnect();
  }
}
