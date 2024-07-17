/**
 * @deprecated - This will be removed in future releases
 */
export interface IStellarWalletsSignBlob {
  blob: string;
  publicKey?: string;
  network?: WalletNetwork;
}

/**
 * @deprecated - This will be removed in future releases
 */
export interface IStellarWalletsSignAuthEntry {
  entryPreimageXDR: string;
  publicKey?: string;
  network?: WalletNetwork;
}

/**
 * @deprecated - This will be removed in future releases
 */
export interface IStellarWalletsSignTx {
  xdr: string;
  publicKey?: string;
  network?: WalletNetwork;
}

export enum WalletNetwork {
  PUBLIC = 'Public Global Stellar Network ; September 2015',
  TESTNET = 'Test SDF Network ; September 2015',
  FUTURENET = 'Test SDF Future Network ; October 2022',
  SANDBOX = 'Local Sandbox Stellar Network ; September 2022',
  STANDALONE = 'Standalone Network ; February 2017',
}

export enum ModuleType {
  HW_WALLET = 'HW_WALLET',
  HOT_WALLET = 'HOT_WALLET',
  BRIDGE_WALLET = 'BRIDGE_WALLET',
  AIR_GAPED_WALLET = 'AIR_GAPED_WALLET',
}

//new: Theme interface
export interface ITheme {
  bgColor: string;
  textColor: string;
  accentColor: string;
  accentColorForeground: string;
}

export interface ISupportedWallet {
  id: string;
  name: string;
  type: string;
  isAvailable: boolean;
  icon: string;
  url: string;
}

/**
 * The Kit Actions are the methods the kit use to interact with the Wallet/Service
 */
export interface KitActions {
  /**
   * Function used to request the public key from the active account or
   * specific path on a wallet.
   *
   * @param params
   * @param params.path - The path to tell the wallet which position to ask.
   * This is commonly used in both hardware wallets and air gaped wallets.
   */
  getPublicKey(params?: { path?: string }): Promise<string>;

  /**
   * A function to request a wallet to sign a built transaction in its XDR mode.
   *
   * @param params
   * @param params.xdr - The transaction to sign, this transaction must be valid
   * and into a base64 xdr format
   * @param params.publicKeys - An array with all the public keys the wallet
   * should use to sign the transaction. If the wallet doesn't allow multiple
   * signatures at once, the module should take care of it.
   * @param params.network - The network to use when signing the transaction
   *
   * @return response - Promise
   * @return response.result - Signed xdr in base64 format
   */
  signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }>;

  /**
   * A function to request a wallet to sign a random blob.
   *
   * @param params
   * @param params.blob - The blob to sign, this blob needs to be in base64
   * @param params.publicKey - Public key the wallet should use to sign, if
   * no public key is provided, the wallet should the one being used by the user.
   *
   * @return response - Promise
   * @return response.result - Signature Buffer in a string format
   */
  signBlob(params: { blob: string; publicKey?: string }): Promise<{ result: string }>;

  /**
   * A function to request a wallet to sign a random blob.
   *
   * @param params
   * @param params.entryPreimageXDR - Authorization entry image in its
   * xdr base64 format
   * @param params.publicKey - Public key the wallet should use to sign, if
   * no public key is provided, the wallet should the one being used by the user.
   *
   * @return response - Promise
   * @return response.result - Signature hash
   */
  signAuthEntry(params: { entryPreimageXDR: string; publicKey?: string }): Promise<{ result: string }>;
}

/**
 * A module is a "plugin" we can use within the kit so is able to handle a
 * specific type of wallet/service. There are some modules that are already
 * in the kit but any wallet developer can create their own plugins
 */
export interface ModuleInterface extends KitActions {
  /**
   * The Module type is used for filtering purposes, define the correct one in
   * your module so we display it accordingly
   */
  moduleType: ModuleType;

  /**
   * This ID of the module, you should expose this ID as a constant variable
   * so developers can use it to show/filter this module if they need to.
   */
  productId: string;

  /**
   * This is the name the kit will show in the builtin Modal.
   */
  productName: string;

  /**
   * This is the URL where users can either download, buy and just know how to
   * get the product.
   */
  productUrl: string;

  /**
   * This icon will be displayed in the builtin Modal along with the product name.
   */
  productIcon: string;

  /**
   * This function should return true is the wallet is installed and/or available.
   * If for example this wallet/service doesn't need to be installed to be used,
   * return `true`.
   *
   * Important:
   * Your wallet/library needs to be able to answer this function in less than 200ms.
   * Otherwise, the kit will show it as unavailable
   *
   */
  isAvailable(): Promise<boolean>;
}
