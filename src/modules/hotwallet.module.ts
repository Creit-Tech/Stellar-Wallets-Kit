import { HOT } from '@hot-wallet/sdk';
import { ModuleInterface, ModuleType, WalletNetwork } from '../types';

export const HOTWALLET_ID = 'hot-wallet';

export class HotWalletModule implements ModuleInterface {
  moduleType: ModuleType;
  productId: string;
  productName: string;
  productUrl: string;
  productIcon: string;

  constructor() {
    this.moduleType = ModuleType.HOT_WALLET;
    this.productId = HOTWALLET_ID;
    this.productName = 'HOT Wallet';
    this.productUrl = 'https://hot-labs.org/wallet';
    this.productIcon = 'https://storage.herewallet.app/logo.png';
  }

  async isAvailable() {
    return true;
  }

  async getAddress() {
    return await HOT.request('stellar:getAddress', {});
  }

  async signTransaction(xdr: string, opts?: { address?: string }) {
    return await HOT.request('stellar:signTransaction', { xdr, accountToSign: opts?.address });
  }

  async signAuthEntry(authEntry: string, opts?: { address?: string }) {
    return await HOT.request('stellar:signAuthEntry', { authEntry, accountToSign: opts?.address });
  }

  async signMessage(message: string, opts?: { address?: string }) {
    return await HOT.request('stellar:signMessage', { message, accountToSign: opts?.address });
  }

  async getNetwork() {
    return { network: 'mainnet', networkPassphrase: WalletNetwork.PUBLIC };
  }
}
