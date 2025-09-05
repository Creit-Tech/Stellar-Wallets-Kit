import { effect } from "@preact/signals";
import { html } from "htm/preact";
import { render } from "preact";
import {
  type AuthModalParams,
  type IKitError,
  type ISupportedWallet,
  type KitActions,
  type KitEvent,
  KitEventType,
  type ModuleInterface,
  type Networks,
  type StellarWalletsKitParams,
  SwkAppLightTheme,
  SwkAppRoute,
  type SwkAppTheme,
} from "@stellar-wallets-kit/types";
import {
  activeAddress,
  activeModules,
  addressUpdatedEvent,
  allowedWallets,
  closeEvent,
  hideUnsupportedWallets,
  modalTitle,
  selectedModuleId,
  selectedNetwork,
  showInstallLabel,
  theme,
} from "@stellar-wallets-kit/state";
import { navigateTo, SwkApp } from "@stellar-wallets-kit/components";
import { parseError } from "./utils.ts";

export class StellarWalletsKit implements KitActions {
  private get selectedModule(): ModuleInterface {
    const savedValue: string | undefined = selectedModuleId.value;

    if (!savedValue) {
      throw { code: -3, message: "Please set the wallet first" };
    }

    const target: ModuleInterface | undefined = activeModules.value.find(
      (mod: ModuleInterface): boolean => mod.productId === savedValue,
    );

    if (!target) {
      throw { code: -3, message: "Please set the wallet first" };
    }

    return target;
  }

  constructor(params: StellarWalletsKitParams) {
    activeModules.value = params.modules;
    if (params.selectedWalletId) this.setWallet(params.selectedWalletId);
    if (params.network) this.setWallet(params.network);
    if (params.theme) this.setTheme(params.theme);
  }

  public setTheme(newTheme: SwkAppTheme = SwkAppLightTheme): void {
    theme.value = newTheme;
  }

  /**
   * This method can be used to set the globally selected wallet
   */
  public setWallet(id: string): void {
    const target: ModuleInterface | undefined = activeModules.value.find(
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
  public async refreshSupportedWallets(): Promise<ISupportedWallet[]> {
    const results: ISupportedWallet[] = await Promise.all(
      activeModules.value.map(async (mod: ModuleInterface): Promise<ISupportedWallet> => {
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

    allowedWallets.value = results;

    return results;
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
  on(type: KitEventType, callback: (event: KitEvent) => void) {
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
  public async authModal(params?: AuthModalParams): Promise<{ address: string }> {
    if (typeof params?.modalTitle !== "undefined") {
      modalTitle.value = params.modalTitle;
    }

    if (typeof params?.showInstallLabel !== "undefined") {
      showInstallLabel.value = params.showInstallLabel;
    }

    if (typeof params?.hideUnsupportedWallets !== "undefined") {
      hideUnsupportedWallets.value = params.hideUnsupportedWallets;
    }

    navigateTo(SwkAppRoute.AUTH_OPTIONS);

    await this.refreshSupportedWallets();

    const wrapper: HTMLDivElement = document.createElement("div");
    (params?.container || document.body).appendChild(wrapper);
    render(
      html`
        <${SwkApp} mode="${params?.container ? "block" : "fixed"}" route="auth" />
      `,
      wrapper,
    );

    const subs: Array<() => void> = [];
    const close = (): void => {
      for (const sub of subs) sub();
      render(null, wrapper);
    };
    return new Promise<{ address: string }>((resolve, reject): void => {
      const sub1 = addressUpdatedEvent.subscribe((result: string | IKitError): void => {
        if (typeof result === "string") {
          resolve({ address: result });
        } else {
          reject(parseError(result));
        }
      });

      const sub2 = closeEvent.subscribe((): void => {
        reject({ code: -1, message: "The user closed the modal." });
      });

      subs.push(sub1);
      subs.push(sub2);
    })
      .then((r) => {
        close();
        return r;
      })
      .catch((e) => {
        close();
        throw e;
      });
  }
}
