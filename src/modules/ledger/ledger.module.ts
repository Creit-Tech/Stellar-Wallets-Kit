import { ModuleInterface, ModuleType, WalletNetwork } from "../../types";

const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const StellarApp = require("@ledgerhq/hw-app-str").default;
const StellarSdk = require("stellar-sdk");

export const LEDGER_ID = 'ledger';

export class LedgerModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HW_WALLET;

  productId: string = LEDGER_ID;
  productName: string = 'Ledger';
  productUrl: string = 'https://www.ledger.com';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/ledger.svg';

  async isAvailable(): Promise<boolean> {
    try {
      const devices = await TransportNodeHid.list();
      return devices.length > 0;
    } catch (error) {
      throw new Error("Error checking Ledger device availability");
    }
  }

  async getPublicKey(): Promise<string> {
    try {
      // Establish connection to the Ledger device
      const transport = await TransportNodeHid.create();
      const stellarApp = new StellarApp(transport);
  
      // Get the public key for the first account on the Ledger device
      const result = await stellarApp.getPublicKey("44'/148'/0'");

      // Close connection
      await transport.close();

      // Return the public key
      return result.publicKey;
    } catch (error) {
      throw new Error("Failed to connect to Ledger device");
    }
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    try {
      // Connect to the Ledger device
      const transport = await TransportNodeHid.create();
      const stellarApp = new StellarApp(transport);
  
      const path = "44'/148'/0'";
  
      // Convert the transaction XDR to a transaction object
      const transaction = new StellarSdk.Transaction(params.xdr, params.network);
  
      // Sign the transaction with the Ledger device
      const result = await stellarApp.signTransaction(path, transaction.signatureBase());
  
      // Add the signature to the transaction
      const signature = result.signature;
      const keyPair = StellarSdk.Keypair.fromPublicKey(result.publicKey);
      const hint = keyPair.signatureHint();
      const decoratedSignature = new StellarSdk.xdr.DecoratedSignature({hint, signature});
      transaction.signatures.push(decoratedSignature);
  
      // Close the transport connection
      await transport.close();
  
      // Return the signed transaction XDR
      return transaction.toXDR();
    } catch (error) {
      throw new Error("Failed to sign transaction with Ledger device");
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
