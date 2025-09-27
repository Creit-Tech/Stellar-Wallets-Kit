import StrImport from "@ledgerhq/hw-app-str";
const Str = StrImport as any;
import TransportImport from "@ledgerhq/hw-transport";
const Transport = TransportImport as any;
import TransportWebUSBImport from "@ledgerhq/hw-transport-webusb";
const TransportWebUSB = TransportWebUSBImport as any;
import { StrKey, Transaction } from "@stellar/stellar-base";
import { encodeBase64 } from "@std/encoding";
import { parseError } from "../utils.ts";
import { type HardwareWalletModuleInterface, ModuleType } from "../../types/mod.ts";
import { hardwareWalletPaths, mnemonicPath, selectedNetwork } from "../../state/mod.ts";

export const LEDGER_ID = "LEDGER";

/**
 * **IMPORTANT**: This module requires that you have a "Buffer" polyfill in your app, if not provided then this module will break your app.
 */
export class LedgerModule implements HardwareWalletModuleInterface {
  moduleType: ModuleType = ModuleType.HW_WALLET;

  productId: string = LEDGER_ID;
  productName: string = "Ledger";
  productUrl: string = "https://www.ledger.com/";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/ledger.png";

  private _transport?: TransportImport.default;
  async transport(): Promise<TransportImport.default> {
    if (!(await TransportWebUSB.isSupported())) throw new Error("Ledger can not be used with this device.");

    if (!this._transport) {
      this._transport = await TransportWebUSB.create();
    }

    if (!this._transport) throw new Error("Ledger Transport was not created.");

    return this._transport;
  }

  async disconnect(): Promise<void> {
    this._transport?.close();
    this._transport = undefined;
  }

  async isAvailable(): Promise<boolean> {
    return TransportWebUSB.isSupported();
  }

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error("Ledger wallets can not be used");
    }
  }

  async getAddress(opts?: { path?: string }): Promise<{ address: string }> {
    await this.runChecks();

    try {
      const finalTransport: typeof Transport = await this.transport();


      const str = new Str(finalTransport);

      let mnemonicPathValue: string | undefined = opts?.path || mnemonicPath.value;

      if (!mnemonicPathValue) {
        mnemonicPathValue = mnemonicPath.value;
      }

      const result: { rawPublicKey: any } = await str.getPublicKey(mnemonicPathValue);
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
    const finalTransport: typeof Transport = await this.transport();

    const str = new Str(finalTransport);
    const startIndex: number = page * 10;
    const results: { publicKey: string; index: number }[] = [];

    for (let i = 0; i < 10; i++) {
      const result: { rawPublicKey: any } = await str.getPublicKey(`44'/148'/${i + startIndex}'`);
      results.push({
        publicKey: StrKey.encodeEd25519PublicKey(result.rawPublicKey),
        index: i + startIndex,
      });
    }

    hardwareWalletPaths.value = results;

    return results;
  }

  async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
      nonBlindTx?: boolean;
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    await this.runChecks();
    const finalTransport: typeof Transport = await this.transport();

    if (!finalTransport) throw new Error("Transport not possible to load.");

    const str = new Str(finalTransport);

    let mnemonicPathValue: string | undefined;
    let account: string;
    if (opts?.path) {
      mnemonicPathValue = opts.path;
      const result: { rawPublicKey: Uint8Array } = await str.getPublicKey(mnemonicPathValue);
      account = StrKey.encodeEd25519PublicKey(result.rawPublicKey as any);
    } else if (opts?.address) {
      const paths: Array<{ publicKey: string; index: number }> = hardwareWalletPaths.value;
      const target: { publicKey: string; index: number } | undefined = paths
        .find((p: { publicKey: string; index: number }): boolean => p.publicKey === opts.address);
      if (!target) throw new Error("This address has not been loaded from this ledger");
      mnemonicPathValue = `44'/148'/${target.index}'`;
      account = target.publicKey;
    } else {
      mnemonicPathValue = mnemonicPath.value;
      if (!mnemonicPathValue) throw new Error("There is no path available, please call the `getAddress` method first.");
      const result: { rawPublicKey: Uint8Array } = await str.getPublicKey(mnemonicPathValue);
      account = StrKey.encodeEd25519PublicKey(result.rawPublicKey as any);
    }

    const network: string | undefined = opts?.networkPassphrase || selectedNetwork.value;
    if (!network) throw new Error("You need to provide or set a network passphrase");

    const tx: Transaction = new Transaction(xdr, network);

    const result: { signature: Uint8Array } = opts?.nonBlindTx
      ? await str.signTransaction(mnemonicPathValue, tx.signatureBase())
      : await str.signHash(mnemonicPathValue, tx.hash());

    tx.addSignature(account, encodeBase64(result.signature));

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
