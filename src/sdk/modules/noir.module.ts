/**
 * Noir module for the Stellar Wallets Kit.
 *
 * Noir (https://noirx402.github.io/noir/) is a browser
 * extension that injects a SEP-43 provider at `window.noir.stellar`. Every
 * provider method resolves (it never rejects) with the SEP-43 result or with
 * `{ error: { code, message } }`; this module turns that error into a throw.
 * Requests are approved by the user in the extension; the module needs no
 * dependency and no polyfill.
 */

import { type ModuleInterface, ModuleType } from "../../types/mod.ts";

export const NOIR_ID: string = "noir";

interface NoirError {
  code: number;
  message: string;
  ext?: string[];
}

type NoirResult<T> = T & { error?: NoirError };

interface NoirSignOpts {
  networkPassphrase?: string;
  address?: string;
}

interface NoirProvider {
  isNoir: true;
  isConnected(): Promise<NoirResult<{ isConnected: boolean }>>;
  isAllowed(): Promise<NoirResult<{ isAllowed: boolean }>>;
  requestAccess(): Promise<NoirResult<{ address: string }>>;
  getAddress(): Promise<NoirResult<{ address: string }>>;
  getNetwork(): Promise<NoirResult<{ network: string; networkPassphrase: string }>>;
  signTransaction(
    xdr: string,
    opts?: NoirSignOpts,
  ): Promise<NoirResult<{ signedTxXdr: string; signerAddress: string }>>;
  signAuthEntry(
    authEntry: string,
    opts?: NoirSignOpts,
  ): Promise<NoirResult<{ signedAuthEntry: string; signerAddress: string }>>;
  signMessage(
    message: string,
    opts?: NoirSignOpts,
  ): Promise<NoirResult<{ signedMessage: string; signerAddress: string }>>;
}

declare const window: { noir?: { stellar?: NoirProvider } } | undefined;

export class NoirModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = NOIR_ID;
  productName: string = "Noir";
  productUrl: string = "https://chromewebstore.google.com/detail/noir/gikfhchijjljpbhokmdmaadgmpbchmjl";
  productIcon: string = NOIR_ICON;

  async isAvailable(): Promise<boolean> {
    return typeof window !== "undefined" && window.noir?.stellar?.isNoir === true;
  }

  async getAddress(params?: { path?: string; skipRequestAccess?: boolean }): Promise<{ address: string }> {
    const provider = await this.provider();
    const { address } = unwrap(
      params?.skipRequestAccess ? await provider.getAddress() : await provider.requestAccess(),
    );
    return { address };
  }

  async signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    const provider = await this.provider();
    const { signedTxXdr, signerAddress } = unwrap(await provider.signTransaction(xdr, signOpts(opts)));
    return { signedTxXdr, signerAddress };
  }

  async signAuthEntry(
    authEntry: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    const provider = await this.provider();
    const { signedAuthEntry, signerAddress } = unwrap(await provider.signAuthEntry(authEntry, signOpts(opts)));
    return { signedAuthEntry, signerAddress };
  }

  async signMessage(
    message: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    const provider = await this.provider();
    const { signedMessage, signerAddress } = unwrap(await provider.signMessage(message, signOpts(opts)));
    return { signedMessage, signerAddress };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    const provider = await this.provider();
    const { network, networkPassphrase } = unwrap(await provider.getNetwork());
    return { network, networkPassphrase };
  }

  private async provider(): Promise<NoirProvider> {
    if (!(await this.isAvailable())) {
      throw { code: -1, message: "Noir is not installed" };
    }
    return window!.noir!.stellar!;
  }
}

/** Only the SEP-43 options Noir reads; `path` is for hardware wallets. */
function signOpts(opts?: { networkPassphrase?: string; address?: string }): NoirSignOpts | undefined {
  if (!opts) return undefined;
  const { networkPassphrase, address } = opts;
  return { networkPassphrase, address };
}

function unwrap<T>(result: NoirResult<T>): T {
  if (result?.error) {
    throw { code: result.error.code, message: result.error.message, ext: result.error.ext?.join(", ") };
  }
  return result;
}

const NOIR_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAABACAMAAACeAI/EAAAAeFBMVEVqY1d0ZlBcUT+CbEqpmHfIxLO1j0vMwarFoWTazK/f1sPAuqe8tKC8s5+Xe06soo2ZekSliFaxmm2bdjWOcD/CvK26rpaenJNxcGlPUlAvNj3OuJDXw5rSqmfCm1Tl2sXt49Dj07Tix5f07+Spgj2jfDoxOEHRp16jjzznAAAAG3RSTlMBLrxa9Lr++vn+/raw4KOa2OL8/Mf2+fT5+fyJotllAAAEQ0lEQVRIx52XDZeiIBSGUwuFtqZy0wwUqaz//w/3foAybbbT3nPmNAqP73v5ZrFYJGmy+DyylH+T5Sr7HF4tWTMTOk8/hFPTikAXUq0/cZ/9UqbzdCq61vabn7vPNr1rO5EFutO2l9ufsclW9rbtRrrruuLS9+or+VFz9X1vCqDTke5aBy9/4D41UM8ViDC9w3/Rew/u38sna9X3V/Qd6IRpgR/t7duuJ9fgu4voG8GicFSUZ+9dg0EhBCI7ogWyEK2lQjXjnlxT0lQb6CSmhe45XrqHTubQwtP7hIaah4WQvoL5a94k6VgmAi2YHsOnDu43z2F9iTvcxursPMTtprnS9VVQiS1uI03Ok31gh4G9X6+zuB6GEec23zGLdHlwszDiUpQTzmPt9wgPZXmYh69XeyhLwD3vxznTBA//pkn9FtOeLYU29g3tYEWZcB4V2W2CpXRv8nZSahHMl35lKoNrbaRzdh52Thp9GBjfMZ2ULNwag/SsONPGFIwHeudTNhJh5+ayRhpxdD8MYRlO2fVIvxa3LuCa3E+0aHVEuznfo7guxER7eKT7WWmgSRzwMI1TeGJpT7tZ6aANEbRXRn8z/krcuidcfvlVI6eOiGn5l7T8Rhvj3MbvRJL7UY7OjX4Wt3rC/bCQnPiaiYmWWj9nLrWJxLkar8gbLzgaB9o8GYdMI+/8u6K05dNbiS36fbQ7bNaR9r8GrW/d+PpY1fVyf1pikz4Z13p5Wi7ruspHD2g9GIfJJZvz+Xw/nxvATdxuPcJQgHFSY+etwTg7sria1gDfPR5bVx6GsnuFKyvT0GdbJP1qrU4gjfx9+a3VpV6efUnNNQGhPtsElDa4hhXOTWy911XDwuB7qmzVerFxEY3eKZo6GjDO+4bXx6guJp4W7WXibX1qmgZk9tXU6rKCjO5NczpVkfKlPWSwsjza9uIiPxJ6DirGdHOCnpJqUnGXtn2ktAs+Hg/g4wR6dZRumpz5UcWF1ukWJPnAlrYP5HVsAEfUNL9k/GmUBYKlcRNFuKUErIdxxvQTPfKWLLcYfk1dpPToDUAtRXBM49hQKKupGooVYWVKdvQ9/1o6hkfa0syFP+PrUL3pZJkVj0A/OjhAfHeONLY3nDk65AgW0dkkZbobjx8W3E+0o76CnX8QwvPxkTwRgYXTTDjfyJojPCMN+xd8YGqyxbSHM9xdokEPo+4U6MPgQwiRPV8zSg932o85BXPjfm5yxWPMHoYb02Wavbim7AnuWoadUjXOZ6UYd4LZ3cwlKElvgg/blmAlT+caf6nVpHjHMr+DXoHlQnEcl5JowK0WQ/k7+8cJPNsJ7WEnq6oiHB8Or9J9cZ7dMeDyCiPnJ/nTO1+yoqSB1Dl+QeKnvj64MpEwsFLmmtyvPrivZUeA85y2thz4fJN9dkdd41pEYap1+ulFNcm2G5iV0tTb7H/uyND7tVy9beo/BoQYdudAjWoAAAAASUVORK5CYII=";
