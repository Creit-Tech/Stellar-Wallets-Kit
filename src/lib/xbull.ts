import { xBullWalletConnect } from '@creit-tech/xbull-wallet-connect';

export const xBullGetPublicKey = async (): Promise<string> => {
  const bridge = new xBullWalletConnect();
  const publicKey = await bridge.connect();
  bridge.closeConnections();
  return publicKey;
};

export const xBullSignTransaction = async (params: IxBullSignParams): Promise<{ signedXDR: string }> => {
  const bridge = new xBullWalletConnect();
  const signedXDR = await bridge.sign({
    xdr: params.xdr,
    publicKey: params.publicKey,
    network: params.networkPassphrase
  });
  bridge.closeConnections();
  return { signedXDR };
};

export interface IxBullSignParams {
  xdr: string;
  publicKey?: string;
  networkPassphrase?: string;
}
