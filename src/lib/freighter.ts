import {
  getPublicKey,
  isConnected,
  signTransaction,
  signBlob,
  signAuthEntry
} from '@stellar/freighter-api';

export const isFreighterInstalled = async () => isConnected();

export const freighterGetPublicKey = async (): Promise<string> => {
  if (!isConnected()) {
    throw new Error(`Freighter is not connected`);
  }

  return getPublicKey();
};

export const freighterSignTransaction = async (
  params: IFreighterSignTxParams
): Promise<string> => {
  if (!isConnected()) {
    throw new Error(`Freighter is not connected`);
  }

  return signTransaction(params.xdr, {
    accountToSign: params.accountToSign,
    networkPassphrase: params.networkPassphrase,
  });
};

export const freighterSignBlob = async (
  params: IFreighterSignBlobParams
): Promise<string> => {
  if (!isConnected()) {
    throw new Error(`Freighter is not connected`);
  }

  return signBlob(params.b64blob, {
    accountToSign: params.accountToSign
  });
};

export const freighterSignAuthEntry = async (
  params: IFreighterSignAuthEntryParams
): Promise<string> => {
  if (!isConnected()) {
    throw new Error(`Freighter is not connected`);
  }

  return signAuthEntry(params.entryPreimageXDR, {
    accountToSign: params.accountToSign
  });
};

export interface IFreighterSignTxParams {
  xdr: string;
  accountToSign?: string;
  networkPassphrase: string;
}

export interface IFreighterSignBlobParams {
  b64blob: string;
  accountToSign?: string;
}

export interface IFreighterSignAuthEntryParams {
  entryPreimageXDR: string;
  accountToSign?: string;
}
