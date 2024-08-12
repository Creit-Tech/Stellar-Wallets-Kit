import { StellarWalletsModal } from './modal/stellar-wallets-modal';
import { ISupportedWallet, ITheme, KitActions, ModuleInterface, WalletNetwork } from './types';

export interface StellarWalletsKitParams {
  selectedWalletId: string;
  network: WalletNetwork;
  modules: ModuleInterface[];
  theme?: ITheme;
}

export class StellarWalletsKit implements KitActions {
  private selectedWallet!: string;
  private selectedModule!: ModuleInterface;
  private network!: WalletNetwork;
  private modalElement?: StellarWalletsModal;
  private readonly modules: ModuleInterface[];
  private theme?: ITheme;

  constructor(params: StellarWalletsKitParams) {
    this.modules = params.modules;
    this.setWallet(params.selectedWalletId);
    this.setNetwork(params.network);

    if (params.theme) {
      this.setTheme(params.theme);
    }
  }

  /**
   * This method will return an array with all wallets supported by this kit but will let you know those the user have already installed/has access to
   * There are wallets that are by default available since they either don't need to be installed or have a fallback
   */
  public async getSupportedWallets(): Promise<ISupportedWallet[]> {
    return Promise.all(
      this.modules.map(async (mod: ModuleInterface): Promise<ISupportedWallet> => {
        const timer: Promise<false> = new Promise(r => setTimeout(() => r(false), 500));
        return {
          id: mod.productId,
          name: mod.productName,
          type: mod.moduleType,
          icon: mod.productIcon,
          isAvailable: await Promise.race([timer, mod.isAvailable()]),
          url: mod.productUrl,
        };
      })
    );
  }

  public setNetwork(network: WalletNetwork): void {
    if (!Object.values(WalletNetwork).includes(network)) {
      throw new Error(`Wallet network "${network}" is not supported`);
    }

    this.network = network;
  }

  public setTheme(theme: ITheme): void {
    this.theme = theme;
  }

  public setWallet(id: string): void {
    const target: ModuleInterface | undefined = this.modules.find(
      (mod: ModuleInterface): boolean => mod.productId === id
    );

    if (!target) {
      throw new Error(`Wallet id "${id}" is not supported`);
    }

    this.selectedWallet = target.productId;
    this.selectedModule = target;
  }

  public async getAddress(params?: { path?: string }): Promise<{ address: string }> {
    if (!this.selectedWallet) {
      throw { code: -3, message: 'Please set the wallet type first' };
    }

    return this.selectedModule.getAddress(params);
  }

  public async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
      submit?: boolean;
      submitUrl?: string;
    }
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    if (!this.selectedWallet) {
      throw { code: -3, message: 'Please set the wallet type first' };
    }

    return this.selectedModule.signTransaction(xdr, { ...opts, networkPassphrase: this.network });
  }

  public async signAuthEntry(
    authEntry: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    if (!this.selectedWallet) {
      throw { code: -3, message: 'Please set the wallet type first' };
    }

    return this.selectedModule.signAuthEntry(authEntry, { ...opts, networkPassphrase: this.network });
  }

  public async signMessage(
    message: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    if (!this.selectedWallet) {
      throw { code: -3, message: 'Please set the wallet type first' };
    }

    return this.selectedModule.signMessage(message, { ...opts, networkPassphrase: this.network });
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    if (!this.selectedWallet) {
      throw { code: -3, message: 'Please set the wallet type first' };
    }

    return this.selectedModule.getNetwork();
  }

  // ---- Modal methods
  public async openModal(params: {
    onWalletSelected: (option: ISupportedWallet) => void;
    onClosed?: (err: Error) => void;
    modalTitle?: string;
    notAvailableText?: string;
  }): Promise<void> {
    if (this.modalElement) {
      throw new Error(`Stellar Wallets Modal is already open`);
    }

    this.modalElement = document.createElement('stellar-wallets-modal') as StellarWalletsModal;
    this.modalElement.setAttribute('showModal', '');

    if (this.theme) {
      this.modalElement.setAttribute('theme', JSON.stringify(this.theme));
    }

    const supportedWallets: ISupportedWallet[] = await this.getSupportedWallets();
    this.modalElement.setAttribute('allowedWallets', JSON.stringify(supportedWallets));

    if (params.modalTitle) {
      this.modalElement.setAttribute('modalTitle', params.modalTitle);
    }

    if (params.notAvailableText) {
      this.modalElement.setAttribute('notAvailableText', params.notAvailableText);
    }

    document.body.appendChild(this.modalElement);

    const listener = (event: CustomEvent) => {
      params.onWalletSelected(event.detail);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.modalElement.removeEventListener('wallet-selected', listener, false);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      document.body.removeChild(this.modalElement);
      this.modalElement = undefined;
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.modalElement.addEventListener('wallet-selected', listener, false);

    const errorListener = (event: CustomEvent) => {
      if (params.onClosed) {
        params.onClosed(event.detail);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.modalElement.removeEventListener('wallet-selected', listener, false);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.modalElement.removeEventListener('modal-closed', errorListener, false);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      document.body.removeChild(this.modalElement);
      this.modalElement = undefined;
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.modalElement.addEventListener('modal-closed', errorListener, false);
  }
  // ---- END Modal methods
}
