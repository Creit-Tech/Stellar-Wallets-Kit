import { effect } from "@preact/signals";
import { html } from "htm/preact";
import { render } from "preact";
import {
  type AuthModalParams,
  type IKitError,
  type ISupportedWallet,
  type KitEventDisconnected,
  type KitEventStateUpdated,
  KitEventType,
  type KitEventWalletSelected,
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
  disconnectEvent,
  hideUnsupportedWallets,
  mode,
  selectedModuleId,
  selectedNetwork,
  showInstallLabel,
  theme,
} from "../state/mod.ts";
import { navigateTo, SwkApp, SwkButton, type SwkButtonProps } from "../components/mod.ts";
import { disconnect, parseError } from "./utils.ts";
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

  /**
   * This method will get you the `address` that's currently active in the Kit's memory. Such address is fetched when the user connects its wallet
   * NOTE: If you want to fetch the address directly from the wallet, use the `fetchAddress` method instead.
   */
  static async getAddress(): Promise<{ address: string }> {
    if (!activeAddress.value) {
      throw {
        code: -1,
        message: "No wallet has been connected.",
      };
    }

    return { address: activeAddress.value };
  }

  static signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
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

  static signAndSubmitTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string },
  ): Promise<{ status: "success" | "pending" }> {
    const module = StellarWalletsKit.selectedModule;

    if (!module.signAndSubmitTransaction) {
      throw {
        code: -3,
        message:
          `The selected module "${module.productName}" does not support the "signAndSubmitTransaction" method. This method is only available for WalletConnect-based modules.`,
      };
    }

    return module.signAndSubmitTransaction(xdr, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || selectedNetwork.value,
    });
  }

  static getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return StellarWalletsKit.selectedModule.getNetwork();
  }

  static async disconnect(): Promise<void> {
    disconnect();
  }

  /**
   * A signal based event you can listen for different events across the kit
   *
   * NOTE: These events are also triggered at launch IE the first time the values are set.
   */
  static on(type: KitEventType.STATE_UPDATED, callback: (event: KitEventStateUpdated) => void): () => void;
  static on(type: KitEventType.WALLET_SELECTED, callback: (event: KitEventWalletSelected) => void): () => void;
  static on(type: KitEventType.DISCONNECT, callback: (event: KitEventDisconnected) => void): () => void;
  static on(type: any, callback: any): () => void {
    switch (type) {
      case KitEventType.STATE_UPDATED: {
        let currentActiveAddress: string | undefined = undefined;
        let currentSelectedNetwork: Networks | undefined = undefined;
        return effect(() => {
          if (
            (activeAddress.value !== currentActiveAddress || selectedNetwork.value !== currentSelectedNetwork)
          ) {
            currentActiveAddress = activeAddress.value;
            currentSelectedNetwork = selectedNetwork.value;
            callback({
              eventType: KitEventType.STATE_UPDATED,
              payload: { address: activeAddress.value, networkPassphrase: selectedNetwork.value },
            });
          }
        });
      }

      case KitEventType.WALLET_SELECTED: {
        let current: string | undefined = undefined;
        return effect(() => {
          if (selectedModuleId.value !== current) {
            current = selectedModuleId.value;
            callback({
              eventType: KitEventType.WALLET_SELECTED,
              payload: { id: selectedModuleId.value },
            });
          }
        });
      }

      case KitEventType.DISCONNECT:
        return disconnectEvent.subscribe((): void => {
          callback({ eventType: KitEventType.DISCONNECT, payload: {} });
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
          isAvailable: await Promise.race([timer, mod.isAvailable()]).catch((): boolean => false),
          isPlatformWrapper: await Promise.race([
            timer,
            mod.isPlatformWrapper ? mod.isPlatformWrapper() : Promise.resolve(false),
          ]).catch((): boolean => false),
          url: mod.productUrl,
        } satisfies ISupportedWallet;
      }),
    );

    allowedWallets.value = results;

    return results;
  }

  static async createButton(container: HTMLElement, props: SwkButtonProps = {}): Promise<void> {
    render(
      html`
        <${SwkButton}
          styles="${props.styles}"
          classes="${props.classes}"
          mode="${props.mode}"
          shape="${props.shape}"
          size="${props.size}"
          onClick="${() => props.onClick && props.onClick()}"
          children="${props.children}"
        />
      `,
      container,
    );
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

    const wrapper: HTMLDivElement = document.createElement("div");
    (params?.container || document.body).appendChild(wrapper);
    render(
      html`
        <${SwkApp} />
      `,
      wrapper,
    );

    await StellarWalletsKit.refreshSupportedWallets();

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
