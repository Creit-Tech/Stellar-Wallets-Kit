import {
  getPublicKey,
  isConnected,
  signTransaction,
} from '@stellar/freighter-api';

export const isFreighterInstalled = async () => isConnected();

export const freighterGetPublicKey = async (): Promise<string> => {
  if (!isConnected()) {
    throw new Error(`Freighter is not connected`);
  }

  return getPublicKey();
};

export const freighterSignTransaction = async (
  params: IFreighterSignParams
): Promise<string> => {
  if (!isConnected()) {
    throw new Error(`Freighter is not connected`);
  }

  return signTransaction(params.xdr, {
    accountToSign: params.accountToSign,
    networkPassphrase: params.networkPassphrase,
  });
};

export interface IFreighterSignParams {
  xdr: string;
  accountToSign?: string;
  networkPassphrase: string;
}
