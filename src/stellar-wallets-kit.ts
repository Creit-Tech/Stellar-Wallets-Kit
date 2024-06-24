import { StellarWalletsModal } from './modal/stellar-wallets-modal';
import {
  IStellarWalletsSignAuthEntry,
  IStellarWalletsSignBlob,
  IStellarWalletsSignTx,
  ISupportedWallet,
  KitActions,
  ModuleInterface,
  WalletNetwork,
  StylesConfig,
} from './types';

export interface StellarWalletsKitParams {
  selectedWalletId: string;
  network: WalletNetwork;
  modules: ModuleInterface[];
  styles?: StylesConfig;
}

export class StellarWalletsKit implements KitActions {
  private selectedWallet!: string;
  private selectedModule!: ModuleInterface;
  private network!: WalletNetwork;
  private modalElement?: StellarWalletsModal;
  private readonly modules: ModuleInterface[];
  private styles?: StylesConfig;

  constructor(params: StellarWalletsKitParams) {
    this.modules = params.modules;
    this.setWallet(params.selectedWalletId);
    this.setNetwork(params.network);
    this.styles = params.styles || {
      primaryColor: '',
      secondaryColor: '',
      backgroundColor: '',
      textColor: '',
    };
  }

  updateStyles(styles: StylesConfig) {
    this.styles = {...this.styles,...styles };
  }

  /**
   * This method will return an array with all wallets supported by this kit but will let you know those the user have already installed/has access to
   * There are wallets that are by default available since they either don't need to be installed or have a fallback
   */
  async getSupportedWallets(): Promise<ISupportedWallet[]> {
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

  public async getPublicKey(params?: { path?: string }): Promise<string> {
    if (!this.selectedWallet) {
      throw new Error('Please set the wallet type first');
    }

    return this.selectedModule.getPublicKey(params);
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    if (!this.selectedWallet) {
      throw new Error('Please set the wallet type first');
    }

    return this.selectedModule.signTx(params);
  }

  async signBlob(params: { blob: string; publicKey?: string }): Promise<{ result: string }> {
    if (!this.selectedWallet) {
      throw new Error('Please set the wallet type first');
    }

    return this.selectedModule.signBlob(params);
  }

  async signAuthEntry(params: { entryPreimageXDR: string; publicKey?: string }): Promise<{ result: string }> {
    if (!this.selectedWallet) {
      throw new Error('Please set the wallet type first');
    }

    return this.selectedModule.signAuthEntry(params);
  }

  /**
   * @deprecated - This method will be removed in future releases.
   * Use specific methods instead like signTx, signBlob, etc
   */
  public async sign(
    params: IStellarWalletsSignBlob | IStellarWalletsSignTx | IStellarWalletsSignAuthEntry
  ): Promise<{ signedXDR: string }> {
    if (!this.selectedWallet) {
      throw new Error('Please set the wallet type first');
    }

    let signedXDR: string;
    if ((params as IStellarWalletsSignTx).xdr) {
      const { result } = await this.selectedModule.signTx({
        xdr: (params as IStellarWalletsSignTx).xdr,
        network: params.network || this.network,
        publicKeys: params.publicKey ? [params.publicKey] : [],
      });
      signedXDR = result;
    } else if ((params as IStellarWalletsSignBlob).blob) {
      const { result } = await this.selectedModule.signBlob({
        blob: (params as IStellarWalletsSignBlob).blob,
        publicKey: params.publicKey,
      });
      signedXDR = result;
    } else if ((params as IStellarWalletsSignAuthEntry).entryPreimageXDR) {
      const { result } = await this.selectedModule.signBlob({
        blob: (params as IStellarWalletsSignAuthEntry).entryPreimageXDR,
        publicKey: params.publicKey,
      });
      signedXDR = result;
    } else {
      throw new Error(`Something went wrong, make sure the parameters are correct`);
    }

    return { signedXDR };
  }

  // ---- Modal methods
  public async openModal(params: {
    onWalletSelected: (option: ISupportedWallet) => void;
    onClosed?: (err: Error) => void;
    modalDialogStyles?: { [name: string]: string | number | undefined | null };
    modalTitle?: string;
    notAvailableText?: string;
  }): Promise<void> {
    if (this.modalElement) {
      throw new Error(`Stellar Wallets Modal is already open`);
    }

    this.modalElement = document.createElement('stellar-wallets-modal') as StellarWalletsModal;
    this.modalElement.setAttribute('showModal', '');

    if (params.modalDialogStyles) {
      this.modalElement.setAttribute('modalDialogStyles', JSON.stringify(params.modalDialogStyles));
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
