import { StellarWalletsButton } from './components/button/stellar-wallets-button';
import { StellarWalletsModal } from './components/modal/stellar-wallets-modal';
import {
  removeAddress,
  seButtonTheme,
  setAddress,
  setAllowedWallets,
  setHorizonUrl,
  setModalTheme,
  setNetwork,
  setSelectedModuleId,
  store,
} from './state/store';
import { IButtonTheme, ISupportedWallet, IModalTheme, KitActions, ModuleInterface, WalletNetwork } from './types';

export interface StellarWalletsKitParams {
  selectedWalletId?: string;
  network: WalletNetwork;
  modules: ModuleInterface[];
  /**
   * @deprecated - This parameter will be removed in a future release, use `modalTheme` instead
   */
  theme?: IModalTheme;
  modalTheme?: IModalTheme;
  buttonTheme?: IButtonTheme;
}

export class StellarWalletsKit implements KitActions {
  private buttonElement?: StellarWalletsButton;
  private modalElement?: StellarWalletsModal;
  private readonly modules: ModuleInterface[];

  private get selectedModule(): ModuleInterface {
    const { selectedModuleId } = store.getValue();

    if (!selectedModuleId) {
      throw { code: -3, message: 'Please set the wallet first' };
    }

    const target: ModuleInterface | undefined = this.modules.find(
      (mod: ModuleInterface): boolean => mod.productId === selectedModuleId
    );

    if (!target) {
      throw { code: -3, message: 'Please set the wallet first' };
    }

    return target;
  }

  constructor(params: StellarWalletsKitParams) {
    this.modules = params.modules;
    if (params.selectedWalletId) this.setWallet(params.selectedWalletId);
    setNetwork(params.network);

    const modalTheme: IModalTheme | undefined = params.theme || params.modalTheme;
    if (modalTheme) {
      setModalTheme(modalTheme);
    }

    if (params.buttonTheme) {
      seButtonTheme(params.buttonTheme);
    }

    this.getSupportedWallets().then((value: ISupportedWallet[]): void => {
      setAllowedWallets(value);
    });
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

  public setWallet(id: string): void {
    const target: ModuleInterface | undefined = this.modules.find(
      (mod: ModuleInterface): boolean => mod.productId === id
    );

    if (!target) {
      throw new Error(`Wallet id "${id}" is not supported`);
    }

    setSelectedModuleId(target.productId);
  }

  public async getAddress(params?: { path?: string }): Promise<{ address: string }> {
    const { address } = await this.selectedModule.getAddress(params);
    setAddress(address);
    return { address };
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
    return this.selectedModule.signTransaction(xdr, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || store.getValue().selectedNetwork,
    });
  }

  public async signAuthEntry(
    authEntry: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return this.selectedModule.signAuthEntry(authEntry, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || store.getValue().selectedNetwork,
    });
  }

  public async signMessage(
    message: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    return this.selectedModule.signMessage(message, {
      ...opts,
      networkPassphrase: opts?.networkPassphrase || store.getValue().selectedNetwork,
    });
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return this.selectedModule.getNetwork();
  }

  async disconnect(): Promise<void> {
    removeAddress();
  }

  // ---- Button methods
  public isButtonCreated(): boolean {
    return !!this.buttonElement;
  }

  /**
   * This method allows developers to set their own buttons (for connection and disconnection) on their website
   * while letting the kit handle the logic behind opening the modal, setting and removing the address from the storage, etc
   */
  public assignButtons(params: {
    connectEl: HTMLElement | string;
    disconnectEl?: HTMLElement | string;
    onConnect: (response: { address: string }) => void;
    onDisconnect: () => void;
  }): void {
    const connectEl: HTMLElement =
      typeof params.connectEl === 'string'
        ? (document.querySelector(params.connectEl) as HTMLElement)
        : params.connectEl;

    if (!connectEl) throw new Error('connectEl is not available');

    connectEl.addEventListener(
      'click',
      () => {
        this.openModal({
          onWalletSelected: option => {
            setSelectedModuleId(option.id);
            this.getAddress().then((r: { address: string }) => params.onConnect(r));
          },
        }).then();
      },
      false
    );

    if (!params.disconnectEl) return;

    const disconnectEl: HTMLElement =
      typeof params.disconnectEl === 'string'
        ? (document.querySelector(params.disconnectEl) as HTMLElement)
        : params.disconnectEl;

    if (!disconnectEl) throw new Error('disconnectEl is not available');

    disconnectEl.addEventListener(
      'click',
      () => {
        params.onDisconnect();
        removeAddress();

        if (this.selectedModule.disconnect) {
          this.selectedModule.disconnect().then();
        }
      },
      false
    );
  }

  /**
   *
   * @param params {Object}
   * @param params.container {HTMLElement} - The container where the button should be rendered.
   * @param params.onConnect {Function} - This callback is called after the user has clicked the button and selected a wallet
   * @param params.onClosed {Function} - This callback is called if the user closes the modal without selecting any wallet.
   * @param params.onError {Function} - This callback is called if there is an error while trying to get the address once the user has selected the wallet from the modal.
   * @param params.onDisconnect {Function} - This callback is called once the user disconnects from the dropdown modal
   * @param params.horizonUrl {String} - If this url is set, the dropdown modal will show the current XLM balance of the address fetched from the wallet
   * @param params.buttonText {String} - A custom text to set inside the button.
   */
  public async createButton(params: {
    container: HTMLElement;
    onConnect: (response: { address: string }) => void;
    onClosed?: (err: Error) => void;
    onError?: (err: Error) => void;
    onDisconnect: () => void;
    horizonUrl?: string;
    buttonText?: string;
  }): Promise<void> {
    if (this.buttonElement) {
      throw new Error(`Stellar Wallets Kit button is already created`);
    }

    this.buttonElement = document.createElement('stellar-wallets-button') as StellarWalletsButton;

    if (params.buttonText) {
      this.buttonElement.setAttribute('buttonText', params.buttonText);
    }

    if (params.horizonUrl) {
      setHorizonUrl(params.horizonUrl);
    }

    params.container.appendChild(this.buttonElement);

    this.buttonElement.addEventListener(
      'button-clicked',
      () => {
        this.openModal({
          onWalletSelected: option => {
            setSelectedModuleId(option.id);
            this.getAddress()
              .then((r: { address: string }) => params.onConnect(r))
              .catch(err => {
                if (params.onError) params.onError(err);
              });
          },
          onClosed: (err: Error): void => {
            if (params.onClosed) params.onClosed(err);
          },
        });
      },
      false
    );

    this.buttonElement.addEventListener(
      'disconnect-wallet',
      () => {
        params.onDisconnect();

        if (this.selectedModule.disconnect) {
          this.selectedModule.disconnect();
        }
      },
      false
    );
  }

  /**
   * Removes the button elements from the HTML and from the kit's instance.
   *
   * @param params.skipDisconnect - Set this to `true` if you want to prevent that we disconnect (for example, disconnecting WalletConnect or removing the address)
   */
  public async removeButton(params?: { skipDisconnect?: boolean }): Promise<void> {
    if (!this.buttonElement) {
      throw new Error(`Stellar Wallets Kit button hasn't been created yet`);
    }

    if (params?.skipDisconnect !== true) {
      this.buttonElement.disconnect();
    }

    this.buttonElement.remove();
    delete this.buttonElement;
  }
  // ---- END Button methods

  // ---- Modal methods
  public async openModal(params: {
    onWalletSelected: (option: ISupportedWallet) => void;
    onClosed?: (err: Error) => void;
    modalTitle?: string;
    notAvailableText?: string;
  }): Promise<void> {
    if (this.modalElement && !this.buttonElement) {
      throw new Error(`Stellar Wallets Kit modal is already open`);
    } else {
      this.modalElement = document.createElement('stellar-wallets-modal') as StellarWalletsModal;
    }

    this.modalElement.setAttribute('showModal', '');

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
