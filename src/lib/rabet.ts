declare const window: Window &
  typeof globalThis & {
    rabet?: {
      connect: () => Promise<{ publicKey: string }>;
      sign: (xdr: string, network: RabetNetwork) => { xdr: string };
    };
  };

export const isRabetAvailable = () => !!window.rabet;

export const rabetGetPublicKey = async (): Promise<{ publicKey: string }> => {
  if (!window?.rabet) {
    throw new Error('Rabet is not installed');
  }

  return window.rabet.connect();
};

export const rabetSignTransaction = async (params: {
  xdr: string;
  network: RabetNetwork;
}): Promise<{ xdr: string }> => {
  if (!window?.rabet) {
    throw new Error('Rabet is not installed');
  }

  return window.rabet.sign(params.xdr, params.network);
};

export enum RabetNetwork {
  PUBLIC = 'mainnet',
  TESTNET = 'testnet',
}
