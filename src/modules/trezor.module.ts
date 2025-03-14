import TrezorConnect from '@trezor/connect-web';
import { transformTransaction } from '@trezor/connect-plugin-stellar';
import { Transaction } from '@stellar/stellar-base';
import { firstValueFrom } from 'rxjs';

import {
  hardwareWalletPaths$,
  mnemonicPath$,
  removeHardwareWalletPaths,
  removeMnemonicPath,
  selectedNetwork$,
  setHardwareWalletPaths,
  setMnemonicPath,
} from '../state/store';
import { ModuleInterface, ModuleType } from '../types';
import { parseError } from '../utils';
import { StellarSelectorModal } from '../components/selector-modal/stellar-selector-modal';

export const TREZOR_ID = 'TREZOR';

export class TrezorModule implements ModuleInterface {
  TrezorConnect: typeof TrezorConnect =
    'default' in TrezorConnect ? (TrezorConnect.default as typeof TrezorConnect) : TrezorConnect;

  private _isAvailable: boolean = false;

  moduleType: ModuleType = ModuleType.HW_WALLET;

  productId: string = TREZOR_ID;
  productName: string = 'Trezor';
  productUrl: string = 'https://www.trezor.com/';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/trezor.png';

  constructor(params: ITrezorModuleParams) {
    this.TrezorConnect.init({
      manifest: {
        appUrl: params.appUrl,
        email: params.email,
      },
      // More advanced options
      debug: params.debug || false,
      lazyLoad: params.lazyLoad || false,
      coreMode: params.coreMode || 'auto',
    }).then(() => {
      console.log('Trezor is ready');
      this._isAvailable = true;
    });
  }

  async disconnect(): Promise<void> {
    removeMnemonicPath();
    removeHardwareWalletPaths();
  }

  /**
   * `TrezorConnect` needs to be started before we can use it but because users most likely
   * won't use their devices as soon as the site loads, we return `true` since it should be already started
   * once the user needs to interact with it.
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async runChecks(): Promise<void> {
    if (!this._isAvailable) {
      throw parseError(new Error('Trezor connection has not been started yet.'));
    }
  }

  async getAddress(opts?: { path?: string }): Promise<{ address: string }> {
    await this.runChecks();

    try {
      const mnemonicPath: string | undefined = opts?.path || (await firstValueFrom(mnemonicPath$));

      if (!mnemonicPath) {
        const result = await this.openAccountSelector();
        return { address: result.publicKey };
      } else {
        const result = await this.TrezorConnect.stellarGetAddress({ path: mnemonicPath, showOnTrezor: false });
        if (!result.success) {
          throw parseError(new Error(result.payload.error));
        }

        return { address: result.payload.address };
      }
    } catch (e) {
      throw parseError(e);
    }
  }

  /**
   * This method is used by the Wallets Kit itself, if you're a dApp developer, most likely you don't need to use this method.
   * @param page - {Number}
   */
  async getAddresses(page: number = 0): Promise<{ publicKey: string; index: number }[]> {
    const startIndex: number = page * 10;
    const bundle: { path: string; showOnTrezor: boolean }[] = new Array(10)
      .fill(undefined)
      .map((_, i): { path: string; showOnTrezor: boolean } => ({
        path: `m/44'/148'/${i + startIndex}'`,
        showOnTrezor: false,
      }));

    const result = await this.TrezorConnect.stellarGetAddress({ bundle });
    if (!result.success) {
      throw parseError(new Error(result.payload.error));
    }

    const results = result.payload.map((item, i) => ({
      publicKey: item.address,
      index: i + startIndex,
    }));

    setHardwareWalletPaths(results);

    return results;
  }

  /**
   * This method is used by the Wallets Kit itself, if you're a dApp developer, most likely you don't need to use this method.
   */
  async openAccountSelector(): Promise<{ publicKey: string; index: number }> {
    return new Promise((resolve, reject) => {
      const el = document.createElement('stellar-accounts-selector') as StellarSelectorModal;
      el.setAttribute('showModal', '');
      el.setAttribute('loadingAccounts', '');
      document.body.appendChild(el);

      this.getAddresses()
        .then(addressesData => {
          el.setAttribute('accounts', JSON.stringify(addressesData));
          el.removeAttribute('loadingAccounts');
        })
        .catch(err => {
          el.remove();
          reject(err);
        });

      const listener = (event: CustomEvent) => {
        const { publicKey, index } = event.detail as { publicKey: string; index: number };
        setMnemonicPath(`44'/148'/${index}'`);
        resolve({ publicKey, index });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        el.removeEventListener('account-selected', listener, false);
        document.body.removeChild(el);
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      el.addEventListener('account-selected', listener, false);

      const errorListener = (event: CustomEvent) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        el.removeEventListener('account-selected', listener, false);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        el.removeEventListener('account-selector-closed', errorListener, false);
        document.body.removeChild(el);
        reject(event.detail);
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      el.addEventListener('account-selector-closed', errorListener, false);
    });
  }

  async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    await this.runChecks();

    let mnemonicPath: string | undefined;
    let account: string;
    if (opts?.path) {
      mnemonicPath = opts.path;
      const result = await this.TrezorConnect.stellarGetAddress({ path: mnemonicPath, showOnTrezor: false });
      if (!result.success) {
        throw new Error(result.payload.error);
      }
      account = result.payload.address;
    } else if (opts?.address) {
      const paths = await firstValueFrom(hardwareWalletPaths$);
      const target = paths.find(p => p.publicKey === opts.address);
      if (!target) throw parseError(new Error('This address has not been loaded from this device'));
      mnemonicPath = `m/44'/148'/${target.index}'`;
      account = target.publicKey;
    } else {
      mnemonicPath = await firstValueFrom(mnemonicPath$);
      if (!mnemonicPath)
        throw parseError(new Error('There is no path available, please call the `getAddress` method first.'));
      const result = await this.TrezorConnect.stellarGetAddress({ path: mnemonicPath, showOnTrezor: false });
      if (!result.success) {
        throw new Error(result.payload.error);
      }
      account = result.payload.address;
    }

    const network: string | undefined = opts?.networkPassphrase || (await firstValueFrom(selectedNetwork$));
    if (!network) throw parseError(new Error('You need to provide or set a network passphrase'));

    const tx: Transaction = new Transaction(xdr, network);
    const parsedTx = transformTransaction(mnemonicPath, tx);
    const result = await this.TrezorConnect.stellarSignTransaction(parsedTx);

    if (!result.success) {
      throw parseError(new Error(result.payload.error));
    }

    tx.addSignature(account, Buffer.from(result.payload.signature, 'hex').toString('base64'));

    return {
      signedTxXdr: tx.toXDR(),
      signerAddress: account,
    };
  }

  async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Trezor Wallets do not support the "signAuthEntry" method',
    };
  }

  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Trezor Wallets do not support the "signMessage" method',
    };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'Trezor Wallets do not support the "getNetwork" method',
    };
  }
}

/**
 * These values are used to start the TrezorConnect library
 */
export interface ITrezorModuleParams {
  appUrl: string;
  email: string;
  debug?: boolean;
  lazyLoad?: boolean;
  coreMode?: 'auto' | 'iframe' | 'popup';
}
