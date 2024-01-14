import albedo from '@albedo-link/intent';

import { ModuleInterface, ModuleType, WalletNetwork } from '../../types';

export const ALBEDO_ID = 'albedo';

export class AlbedoModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = ALBEDO_ID;
  productName: string = 'Albedo';
  productUrl: string = 'https://albedo.link/';
  productIcon: string =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iMTI4LjAwMDAwMHB0IiBoZWlnaHQ9IjEyOC4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDEyOC4wMDAwMDAgMTI4LjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsMTI4LjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iIzAwOTJiYiIgc3Ryb2tlPSJub25lIj4KPHBhdGggZD0iTTYwOSAxMjQwIGMtMiAtMTYgLTUgLTIzIC0yNiAtNzAgLTIwIC00NCAtNTQgLTEyNiAtNjkgLTE2NSAtNCAtMTEKLTYgLTIzIC02IC0yNyAxIC01IC0zIC04IC05IC04IC01IDAgLTggLTQgLTQgLTkgMyAtNSAxIC0xMiAtNSAtMTYgLTYgLTQgLTgKLTExIC01IC0xNiA0IC01IDEgLTkgLTQgLTkgLTYgMCAtMTEgLTcgLTExIC0xNSAwIC04IC0xNiAtNDkgLTM2IC05MiAtMjAgLTQyCi0zNyAtODIgLTM4IC04OCAtMSAtNSAtMTIgLTI4IC0yMyAtNTAgLTExIC0yMiAtMjEgLTQzIC0yMiAtNDcgLTEgLTQgLTExIC0yOQotMjIgLTU1IC0xMiAtMjcgLTIyIC01NSAtMjQgLTYzIC0yIC04IC0xMiAtMzMgLTIzIC01NSAtMTEgLTIyIC0yNiAtNTggLTMzCi04MCAtOCAtMjIgLTE2IC00MiAtMjAgLTQ1IC04IC03IC03OCAtMTc3IC05MSAtMjIwIC02IC0xOSAtMTcgLTQ0IC0yNCAtNTUKLTIyIC0zMSAtMTcgLTM1IDQ5IC0zNSBsNjIgMCAxNyAzOCBjMjMgNTMgMzEgNzYgMzAgODQgLTEgNSAzIDggOCA4IDUgMCA5IDMKOSA4IC0xIDQgMCAxMCAxIDE1IDEgNCAzIDEwIDQgMTUgMSA0IDEwIDI0IDE5IDQ2IDE5IDQyIDEzIDQyIDExNyAxMSAxMTEgLTMzCjQ2NCAtMjggNDg2IDYgMyA1IDkgNyAxNCA0IDUgLTMgMjUgMSA0NCA5IGwzNiAxNSAyMSAtNDcgYzExIC0yNiAyNyAtNjUgMzUKLTg3IDggLTIyIDIxIC01MCAzMCAtNjIgOCAtMTMgMTIgLTIzIDkgLTIzIC0zIDAgLTEgLTkgNSAtMjAgOCAtMTQgMjEgLTIwIDQ2Ci0yMCBsMzYgMCAtMjIgMzUgYy0xMiAxOSAtMTkgMzUgLTE1IDM1IDMgMCAtMyAxNyAtMTMgMzggLTE4IDM0IC0zNCA2OSAtMzYKODIgLTEgMyAtOCAyMSAtMTcgNDAgLTkgMTkgLTI5IDY3IC00NCAxMDUgLTE1IDM5IC0zMyA4MSAtNDEgOTUgLTcgMTQgLTM4IDg4Ci03MCAxNjUgLTY1IDE1OSAtMTA5IDI2MiAtMTI0IDI4NyAtNSAxMCAtMTAgMjIgLTEwIDI4IDAgMTAgLTM2IDk0IC03MSAxNjMKLTEwIDIyIC0xOSA0NSAtMTkgNTMgMCA4IC01IDE0IC0xMSAxNCAtNSAwIC04IDQgLTQgOSAzIDUgMSAxMiAtNSAxNiAtNiA0IC04CjExIC01IDE2IDQgNSAxIDkgLTYgOSAtNyAwIC05IDMgLTYgNyA0IDMgMiAxMiAtNCAyMCAtMTMgMTUgLTU4IDE4IC02MCAzegptOTYgLTIzNCBjMTQgLTMwIDI1IC01OCAyNSAtNjEgMCAtNiAyNCAtNjIgNjAgLTE0MCAxMCAtMjIgMjIgLTUyIDI1IC02NyA0Ci0xNiAxMCAtMjggMTQgLTI4IDQgMCA4IC02IDggLTEyIDAgLTcgOSAtMzMgMjEgLTU4IDExIC0yNSAzMyAtNzQgNDggLTExMCAxNAotMzYgMzQgLTgzIDQ0IC0xMDUgNDEgLTkyIDQ0IC0xMDUgMjkgLTExOSAtOCAtNyAtNTkgLTIxIC0xMTQgLTMxIC0xMjQgLTIzCi0yOTIgLTIzIC0zOTUgMCAtNDEgOSAtODMgMTggLTk0IDIwIC0yOSA3IC0zMCAxMiAtMTAgNTcgMTAgMjMgMTkgNDUgMTkgNDggMQozIDE0IDMyIDMwIDY0IDE1IDMzIDI4IDY2IDI4IDczIDAgNyA0IDEzIDkgMTMgNSAwIDcgNCAzIDkgLTMgNSAtMSAxMiA1IDE2IDYKNCA4IDExIDUgMTYgLTQgNSAtMSA5IDQgOSA2IDAgMTEgNyAxMSAxNSAwIDggNCAyMyA5IDMzIDE5IDM0IDY5IDE0OCA4MiAxODcKOCAyMiAxOCA0MyAyMiA0NiA1IDMgOSAxMCA5IDE1IDAgNSA0IDE4IDkgMjkgMTIgMzIgMjAgNjAgMTkgNjQgLTEgMiAyIDcgNwoxMCA1IDMgMTQgMTggMjAgMzQgNyAxNSAxNSAyNyAxOCAyNyAzIDAgMTYgLTI0IDMwIC01NHoiLz4KPC9nPgo8L3N2Zz4K';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getPublicKey(): Promise<string> {
    return albedo.publicKey({}).then(({ pubkey }) => pubkey);
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    if (params.network !== WalletNetwork.PUBLIC && params.network !== WalletNetwork.TESTNET) {
      throw new Error(`Albedo doesn't support the network: ${params.network}`);
    }

    let updatedXdr: string = params.xdr;
    for (const publicKey of params.publicKeys) {
      updatedXdr = await albedo
        .tx({
          xdr: updatedXdr,
          pubkey: publicKey,
          network: params.network === WalletNetwork.PUBLIC ? AlbedoNetwork.PUBLIC : AlbedoNetwork.TESTNET,
        })
        .then(({ signed_envelope_xdr }) => signed_envelope_xdr);
    }

    return { result: updatedXdr };
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signBlob(params: { blob: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Albedo does not support signing random blobs');
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signAuthEntry(params: { entryPreimageXDR: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Albedo does not support signing authorization entries');
  }
}

export enum AlbedoNetwork {
  PUBLIC = 'public',
  TESTNET = 'testnet',
}
