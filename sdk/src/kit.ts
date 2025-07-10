import type { IOnChangeEvent, ISupportedWallet, KitActions, ModuleInterface, StellarWalletsKitParams } from "./types.ts";
import { activeAddress, selectedModuleId, selectedNetwork } from "./state.ts";
import type { Networks } from "@stellar/stellar-sdk";

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
    selectedModuleId.value = address;
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

  public onChange?(callback: (event: IOnChangeEvent) => void): void {
    throw new Error("Method not implemented.");
  }

  // ---------------------------------------------- Modal methods ----------------------------------------------
  public async openModal() {

  }
}
