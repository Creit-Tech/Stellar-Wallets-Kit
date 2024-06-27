import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Btc from "@ledgerhq/hw-app-btc";
import StellarSdk from "stellar-sdk";
import { ModuleInterface, ModuleType } from "../../types";

export const LEDGER_ID = 'ledger';

export class LedgerModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HW_WALLET;

  productId: string = LEDGER_ID;
  productName: string = 'Ledger';
  productUrl: string = 'https://www.ledger.com';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/ledger.svg';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getPublicKey(): Promise<string> {
    try {
      const transport = await TransportWebUSB.create();
      const btc = new Btc(transport);

      const result = await btc.getWalletPublicKey("44'/148'/0'");

      return result.publicKey;
    } catch (error) {
      throw new Error(`Ledger connection error: ${error}`);
    }
  }

  async signTx(transaction: StellarSdk.Transaction): Promise<{ result: string }> {
    try {
      const transport = await TransportWebUSB.create();
      const btc = new Btc(transport);

      // Convert Stellar transaction to bytes
      const transactionBytes = transaction.toEnvelope().toXDR("base64");

      // Sign the transaction with Ledger
      const signature = await btc.signTransaction("44'/148'/0'", transactionBytes);

      return signature;
    } catch (error) {
      throw new Error(`Ledger signing error: ${error}`);
    }
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signBlob(params: { blob: string }): Promise<{ result: string }> {
    throw new Error('Ledger does not support signing random blobs');
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signAuthEntry(params: { entryPreimageXDR: string }): Promise<{ result: string }> {
    throw new Error('Ledger does not support signing authorization entries');
  }
}
