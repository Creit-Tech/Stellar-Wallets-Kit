import { effect } from "@preact/signals";
import { html } from "htm/preact";
import { render } from "preact";
import {
  type AuthModalParams,
  type IKitError,
  type ISupportedWallet,
  type KitEvent,
  KitEventType,
  type ModuleInterface,
  type Networks,
  type ProfileModalParams,
  type StellarWalletsKitInitParams,
  SwkAppLightTheme,
  SwkAppMode,
  SwkAppRoute,
  type SwkAppTheme,
} from "../types/mod.ts";
import {
  activeAddress,
  activeModule,
  activeModules,
  addressUpdatedEvent,
  allowedWallets,
  closeEvent,
  hideUnsupportedWallets,
  mode,
  resetWalletState,
  selectedModuleId,
  selectedNetwork,
  showInstallLabel,
  theme,
} from "../state/mod.ts";
import { navigateTo, SwkApp } from "../components/mod.ts";
import { parseError } from "./utils.ts";
import { resetHistory } from "../components/router.ts";

export class StellarWalletsKit {
  static init(params: StellarWalletsKitInitParams) {
    activeModules.value = params.modules;
    if (params.selectedWalletId) StellarWalletsKit.setWallet(params.selectedWalletId);
    if (params.network) StellarWalletsKit.setNetwork(params.network);
    if (params.theme) StellarWalletsKit.setTheme(params.theme);
    if (params.authModal) {
      if (typeof params.authModal.showInstallLabel !== "undefined") {
        showInstallLabel.value = params.authModal.showInstallLabel;
      }

      if (typeof params.authModal.hideUnsupportedWallets !== "undefined") {
        hideUnsupportedWallets.value = params.authModal.hideUnsupportedWallets;
      }
    }
  }

  static get selectedModule(): ModuleInterface {
    if (!activeModule.value) {
      throw { code: -3, message: "Please set the wallet first" };
    }

    return activeModule.value;
  }

  /**
   * This method sets the active wallet (module) that will be used when calling others methods (for example getAddress).
   */
  static setWallet(id: string): void {
    const target: ModuleInterface | undefined = activeModules.value.find((mod: ModuleInterface): boolean =>
      mod.productId === id
    );

    if (!target) throw new Error(`Wallet id "${id}" is not and existing module`);

    selectedModuleId.value = target.productId;
  }

  /**
   * This method sets the Stellar network the kit will use across calls.
   */
  static setNetwork(network: Networks): void {
    selectedNetwork.value = network;
  }

  /**
   * You can manually update the kit's styles with this method.
   */
  static setTheme(newTheme: SwkAppTheme = SwkAppLightTheme): void {
    theme.value = newTheme;
  }

  // ---------------------------------------------- Wallet Interaction ----------------------------------------------

  static async getAddress(params?: { path?: string }): Promise<{ address: string }> {
    const { address } = await StellarWalletsKit.selectedModule.getAddress(params);
    activeAddress.value = address;
    return { address };
  }

  static signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string; submit?: boolean; submitUrl?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    return StellarWalletsKit.selectedModule.signTransaction(xdr, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || selectedNetwork.value,
    });
  }

  static signAuthEntry(
    authEntry: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return StellarWalletsKit.selectedModule.signAuthEntry(authEntry, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || selectedNetwork.value,
    });
  }

  static signMessage(
    message: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    return StellarWalletsKit.selectedModule.signMessage(message, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || selectedNetwork.value,
    });
  }

  static getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return StellarWalletsKit.selectedModule.getNetwork();
  }

  static async disconnect(): Promise<void> {
    if (StellarWalletsKit.selectedModule.disconnect) {
      await StellarWalletsKit.selectedModule.disconnect();
    }
    resetWalletState();
  }

  /**
   * A signal based event you can listen for different events across the kit
   */
  static on(type: KitEventType, callback: (event: KitEvent) => void) {
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

  static async refreshSupportedWallets(): Promise<ISupportedWallet[]> {
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

  // ---------------------------------------------- Modal methods ----------------------------------------------
  /**
   * This method opens an "authentication" modal where the user can pick the wallet they want to connect,
   * it sets the selected wallet as the currently active module and then it requests the public key from the wallet.
   */
  static async authModal(params?: AuthModalParams): Promise<{ address: string }> {
    resetHistory();
    navigateTo(SwkAppRoute.AUTH_OPTIONS);
    mode.value = params?.container ? SwkAppMode.BLOCK : SwkAppMode.FIXED;

    await StellarWalletsKit.refreshSupportedWallets();

    const wrapper: HTMLDivElement = document.createElement("div");
    (params?.container || document.body).appendChild(wrapper);
    render(
      html`
        <${SwkApp} />
      `,
      wrapper,
    );

    const subs: Array<() => void> = [];
    const close = (): void => {
      for (const sub of subs) sub();
      render(null, wrapper);
      wrapper.parentNode?.removeChild(wrapper);
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

  /**
   * This method opens the "profile" modal, this modal allows the user to check its currently connected account, copy its public key
   */
  // deno-lint-ignore require-await
  static async profileModal(params?: ProfileModalParams): Promise<void> {
    if (!activeAddress.value) {
      throw { code: -1, message: "There is no active address, the user needs to authenticate first." };
    }

    resetHistory();
    navigateTo(SwkAppRoute.PROFILE_PAGE);
    mode.value = params?.container ? SwkAppMode.BLOCK : SwkAppMode.FIXED;

    const wrapper: HTMLDivElement = document.createElement("div");
    (params?.container || document.body).appendChild(wrapper);
    render(
      html`
        <${SwkApp} />
      `,
      wrapper,
    );

    const sub = closeEvent.subscribe((): void => {
      sub();
      render(null, wrapper);
      wrapper.parentNode?.removeChild(wrapper);
    });
  }
}
