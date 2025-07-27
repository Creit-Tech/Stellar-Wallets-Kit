import {
  type ISupportedWallet,
  type KitActions,
  type KitEvent,
  KitEventType,
  type ModuleInterface,
  type AuthModalParams,
  type StellarWalletsKitParams,
} from "./types.ts";
import { activeAddress, selectedModuleId, selectedNetwork } from "./state.ts";
import type { Networks } from "@stellar/stellar-sdk";
import { effect } from "./signals.ts";
import { parseError } from "./utils.ts";

export class StellarWalletsKit implements KitActions {
  private readonly modules: ModuleInterface[];

  private get selectedModule(): ModuleInterface {
    const savedValue: string | undefined = selectedModuleId.value;

    if (!savedValue) {
      throw { code: -3, message: "Please set the wallet first" };
    }

    const target: ModuleInterface | undefined = this.modules.find(
      (mod: ModuleInterface): boolean => mod.productId === savedValue,
    );

    if (!target) {
      throw { code: -3, message: "Please set the wallet first" };
    }

    return target;
  }

  constructor(params: StellarWalletsKitParams) {
    this.modules = params.modules;
    if (params.selectedWalletId) this.setWallet(params.selectedWalletId);
    if (params.network) this.setWallet(params.network);
  }

  /**
   * This method can be used to set the globally selected wallet
   */
  public setWallet(id: string): void {
    const target: ModuleInterface | undefined = this.modules.find(
      (mod: ModuleInterface): boolean => mod.productId === id,
    );

    if (!target) throw new Error(`Wallet id "${id}" is not and existing module`);

    selectedModuleId.value = target.productId;
  }

  /**
   * This method can be used to set the globally selected network
   */
  public setNetwork(network: Networks): void {
    selectedNetwork.value = network;
  }

  /**
   * This method will return an array with all wallets supported by this kit's instance but will let you know those the user have already installed/has access to
   * There are wallets that are by default available since they either don't need to be installed or have a fallback method like a PWA version
   */
  public getSupportedWallets(): Promise<ISupportedWallet[]> {
    return Promise.all(
      this.modules.map(async (mod: ModuleInterface): Promise<ISupportedWallet> => {
        const timer: Promise<false> = new Promise((r) => setTimeout(() => r(false), 1000));
        return {
          id: mod.productId,
          name: mod.productName,
          type: mod.moduleType,
          icon: mod.productIcon,
          isAvailable: await Promise.race([timer, mod.isAvailable()]),
          url: mod.productUrl,
        };
      }),
    );
  }

  // ---------------------------------------------- Wallet Interaction ----------------------------------------------

  public async getAddress(params?: { path?: string }): Promise<{ address: string }> {
    const { address } = await this.selectedModule.getAddress(params);
    activeAddress.value = address;
    return { address };
  }

  public signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string; submit?: boolean; submitUrl?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    return this.selectedModule.signTransaction(xdr, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || selectedNetwork.value,
    });
  }

  public signAuthEntry(
    authEntry: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return this.selectedModule.signAuthEntry(authEntry, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || selectedNetwork.value,
    });
  }

  public signMessage(
    message: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    return this.selectedModule.signMessage(message, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || selectedNetwork.value,
    });
  }

  public getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return this.selectedModule.getNetwork();
  }

  public async disconnect(): Promise<void> {
    if (this.selectedModule.disconnect) {
      await this.selectedModule.disconnect();
    }
    activeAddress.value = undefined;
  }

  /**
   * A signal based event you can listen for different events across the kit
   */
  on(type: KitEventType, callback: (event: KitEvent) => void): { (): void; [Symbol.dispose](): void } {
    switch (type) {
      case KitEventType.STATE_UPDATED:
        return effect(() => {
          console.log(`Wallets Kit Effect: ${KitEventType.STATE_UPDATED}`);
          if (activeAddress.value && selectedNetwork.value) {
            callback({
              eventType: KitEventType.STATE_UPDATED,
              payload: { address: activeAddress.value, networkPassphrase: selectedNetwork.value },
            });
          }
        });

      case KitEventType.WALLET_SELECTED:
        return effect(() => {
          console.log(`Wallets Kit Effect: ${KitEventType.WALLET_SELECTED}`);
          if (selectedModuleId.value) {
            callback({
              eventType: KitEventType.WALLET_SELECTED,
              payload: { id: selectedModuleId.value },
            });
          }
        });

      default:
        throw new Error(`${type} event type is not supported`);
    }
  }

  // ---------------------------------------------- Modal methods ----------------------------------------------
  /**
   * This method opens an "authentication" modal where the user can pick the wallet they want to connect,
   * it sets the selected wallet as the currently active module and then it requests the public key from the wallet.
   */
  public authModal(params?: AuthModalParams): Promise<{ address: string }> {
    return new Promise((resolve, reject) => {
      const el: HTMLElement = document.createElement("kit-auth-modal");

      el.setAttribute("mode", "fixed");
      if (params?.title) {
        const title: string | undefined = params.title;
        el.setAttribute("title", title!);
      }

      if (typeof params?.explanation !== "undefined") {
        el.setAttribute("explanation", params.explanation.toString());
      }

      if (typeof params?.showNotInstalledLabel !== "undefined") {
        el.setAttribute("show-not-installed-label", params.showNotInstalledLabel.toString());
      }

      if (params?.notInstalledText) {
        const text: string | undefined = params.notInstalledText;
        el.setAttribute("not-installed-text", text!);
      }

      this.getSupportedWallets()
        .then(wallets => {
          el.setAttribute("wallets", JSON.stringify(wallets));

          const listener = (event: CustomEvent<ISupportedWallet>) => {
            selectedModuleId.value = event.detail.id;
            el.removeEventListener<any>("wallet-selected", listener, false);
            document.body.removeChild(el);
            this.getAddress()
              .then((response: { address: string }): void => {
                resolve(response);
              })
              .catch((err): void => {
                reject(parseError(err));
              });
          };
          el.addEventListener<any>("wallet-selected", listener, false);

          const closeListener = (event: CustomEvent) => {
            el.removeEventListener<any>("close", closeListener, false);
            document.body.removeChild(el);
            reject(parseError(event.detail));
          };
          el.addEventListener<any>("close", closeListener, false);

          document.body.appendChild(el);
        })
        .catch(err => {
          reject(parseError(err));
        });
    });
  }
}
