import { ModuleInterface, ModuleType, WalletNetwork } from '../types';
import * as StellarSDK from '@stellar/stellar-sdk';
import transformTrezorTransaction from '@trezor/connect-plugin-stellar';
import TrezorConnect, { Success, Unsuccessful } from '@trezor/connect';

export const TREZOR_ID = 'trezor';

export class TrezorModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HW_WALLET;
  productId: string = TREZOR_ID;
  productName: string = 'trezor';
  productUrl: string = 'https://trezor.io';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/trezor.svg';

  async isAvailable(): Promise<boolean> {
    try {
      /* 
      * Perform a check for Trezor hardware availability. 
      * If getFeatures() succeeds and returns success: true, 
      * then Trezor hardware is considered available. LC 06/24
      */
      const isTrezorConnected = await TrezorConnect.getFeatures();
      return isTrezorConnected.success;
    } catch (error) {
      console.error('Error checking Trezor availability:', error);
      return false;
    }
  }

  async getPublicKey(params?: { path?: string }): Promise<string> {
    try {
      const { path } = params || {};

      if (!path) {
        throw new Error('Path parameter is required for getPublicKey');
      }

      const response = await TrezorConnect.getPublicKey({path});

      if ('success' in response && response.success) {
        const successResponse = response as Success<{ publicKey: string }>;
        return successResponse.payload.publicKey;
      } else {
        const errorResponse = response as Unsuccessful;
        throw new Error(`Failed to retrieve public key from Trezor: ${errorResponse.payload.error}`);
      }
    } catch (error) {
      console.error('Error getting public key from Trezor:', error);
      throw error;
    }
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    try {
      const { xdr, publicKeys, network } = params;

      if (!xdr || !publicKeys || !publicKeys.length || !network) {
        throw new Error('Missing required parameters for signTx');
      }

      // Create a Stellar transaction from the XDR. LC 06/24
      const tx = new StellarSDK.Transaction(xdr, network);
      // Path for Stellar derivation. LC 06/24
      const path = "m/44'/148'/0'";
      // Transform the Stellar transaction for Trezor. LC 06/24
      const transformedTx = transformTrezorTransaction(path, tx);

      const result = await TrezorConnect.stellarSignTransaction({
        path,
        networkPassphrase: network,
        transaction: transformedTx.transaction,
      });

      if ('success' in result && result.success) {
        return { result: result.payload.signature };
      } else {
        throw new Error(`Failed to sign Stellar transaction with Trezor: ${result.payload.error}`);
      }
    } catch (error) {
      console.error('Error signing Stellar transaction with Trezor:', error);
      throw error;
    }
  }

  // Trezor does not support signing random blobs. LC 06/24
  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signBlob(params: { blob: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Trezor does not support signing random blobs');
  }

  // Trezor does not support signing authorization entries. LC 06/24
  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signAuthEntry(params: { entryPreimageXDR: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Trezor does not support signing authorization entries');
  }
}
