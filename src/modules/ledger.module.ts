import Str from '@ledgerhq/hw-app-str';
import Transport from '@ledgerhq/hw-transport';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { Buffer } from 'buffer';
import { firstValueFrom } from 'rxjs';
import { StellarSelectorModal } from '../components/selector-modal/stellar-selector-modal';
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
import { StrKey } from '@stellar/stellar-base';
import { parseError } from '../utils';
import { Transaction } from '@stellar/stellar-base';

export const LEDGER_ID = 'LEDGER';

export class LedgerModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HW_WALLET;

  productId: string = LEDGER_ID;
  productName: string = 'Ledger';
  productUrl: string = 'https://www.ledger.com/';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/ledger.png';

  private _transport?: Transport;
  async transport() {
    if (!(await TransportWebUSB.isSupported())) throw new Error('Ledger can not be used with this device.');

    if (!this._transport) {
      this._transport = await TransportWebUSB.create();
    }

    return this._transport;
  }

  async disconnect(): Promise<void> {
    removeMnemonicPath();
    removeHardwareWalletPaths();
    this._transport?.close();
    this._transport = undefined;
  }

  /**
   * This always return true because in theory ledgers aren't supposed
   * to be connected at all time
   */
  async isAvailable(): Promise<boolean> {
    return TransportWebUSB.isSupported();
  }

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error('Ledger wallets can not be used');
    }
  }

  async getAddress(opts?: { path?: string }): Promise<{ address: string }> {
    await this.runChecks();

    try {
      const finalTransport: Transport = await this.transport();
      const str = new Str(finalTransport);

      let mnemonicPath: string | undefined = opts?.path || (await firstValueFrom(mnemonicPath$));

      if (!mnemonicPath) {
        await this.openAccountSelector();
        mnemonicPath = await firstValueFrom(mnemonicPath$);
      }

      const result: { rawPublicKey: Buffer } = await str.getPublicKey(mnemonicPath!);
      return { address: StrKey.encodeEd25519PublicKey(result.rawPublicKey) };
    } catch (e) {
      throw parseError(e);
    }
  }

  /**
   * This method is used by the Wallets Kit itself, if you're a dApp developer, most likely you don't need to use this method.
   * @param page - {Number}
   */
  async getAddresses(page: number = 0): Promise<{ publicKey: string; index: number }[]> {
    const finalTransport: Transport = await this.transport();
    const str = new Str(finalTransport);
    const startIndex: number = page * 10;
    const results: { publicKey: string; index: number }[] = [];

    for (let i = 0; i < 10; i++) {
      const result: { rawPublicKey: Buffer } = await str.getPublicKey(`44'/148'/${i + startIndex}'`);
      results.push({
        publicKey: StrKey.encodeEd25519PublicKey(result.rawPublicKey),
        index: i + startIndex,
      });
    }

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
      nonBlindTx?: boolean;
    }
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    await this.runChecks();
    const finalTransport: Transport = await this.transport();
    const str = new Str(finalTransport);

    let mnemonicPath: string | undefined;
    let account: string;
    if (opts?.path) {
      mnemonicPath = opts.path;
      const result: { rawPublicKey: Buffer } = await str.getPublicKey(mnemonicPath);
      account = StrKey.encodeEd25519PublicKey(result.rawPublicKey);
    } else if (opts?.address) {
      const paths = await firstValueFrom(hardwareWalletPaths$);
      const target = paths.find(p => p.publicKey === opts.address);
      if (!target) throw new Error('This address has not been loaded from this ledger');
      mnemonicPath = `44'/148'/${target.index}'`;
      account = target.publicKey;
    } else {
      mnemonicPath = await firstValueFrom(mnemonicPath$);
      if (!mnemonicPath) throw new Error('There is no path available, please call the `getAddress` method first.');
      const result: { rawPublicKey: Buffer } = await str.getPublicKey(mnemonicPath);
      account = StrKey.encodeEd25519PublicKey(result.rawPublicKey);
    }

    const network: string | undefined = opts?.networkPassphrase || (await firstValueFrom(selectedNetwork$));
    if (!network) throw new Error('You need to provide or set a network passphrase');

    const tx: Transaction = new Transaction(xdr, network);

    const result: { signature: Buffer } = opts?.nonBlindTx
      ? await str.signTransaction(mnemonicPath, tx.signatureBase())
      : await str.signHash(mnemonicPath, tx.hash());

    tx.addSignature(account, result.signature.toString('base64'));

    return {
      signedTxXdr: tx.toXDR(),
      signerAddress: account,
    };
  }

  async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Ledger Wallets do not support the "signAuthEntry" function',
    };
  }

  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Ledger Wallets do not support the "signMessage" function',
    };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'Ledger Wallets do not support the "getNetwork" function',
    };
  }
}
