export interface IModalTheme {
  bgColor: string;
  textColor: string;
  solidTextColor: string;
  headerButtonColor: string;
  dividerColor: string;
  helpBgColor: string;
  notAvailableTextColor: string;
  notAvailableBgColor: string;
  notAvailableBorderColor: string;
}

/**
 * @deprecated - This type is deprecated, use `IModalTheme` instead
 */
export type ITheme = IModalTheme;

export interface IButtonTheme {
  bgColor: string;
  textColor: string;
  solidTextColor: string;
  dividerColor: string;
  buttonPadding: string;
  buttonBorderRadius: string;
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
   * @param params.path - The path to tell the wallet which position to ask. This is commonly used in hardware wallets.
   *
   * @return Promise<{ address: string }>
   */
  getAddress(params?: { path?: string }): Promise<{ address: string }>;

  /**
   * A function to request a wallet to sign a built transaction in its XDR mode
   *
   * @param xdr - A Transaction or a FeeBumpTransaction
   * @param opts - Options compatible with https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md#signtransaction
   * @param opts.networkPassphrase - The Stellar network to use when signing
   * @param opts.address - The public key of the account that should be used to sign
   * @param opts.path - This options is added for special cases like Hardware wallets
   *
   * @return Promise<{ signedTxXdr: string; signerAddress: string }>
   */
  signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
      submit?: boolean;
      submitUrl?: string;
    }
  ): Promise<{ signedTxXdr: string; signerAddress?: string }>;

  /**
   * A function to request a wallet to sign an AuthEntry XDR.
   *
   * @param authEntry - An XDR string version of `HashIdPreimageSorobanAuthorization`
   * @param opts - Options compatible with https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md#signauthentry
   * @param opts.networkPassphrase - The Stellar network to use when signing
   * @param opts.address - The public key of the account that should be used to sign
   * @param opts.path - This options is added for special cases like Hardware wallets
   *
   * @return - Promise<{ signedAuthEntry: string; signerAddress: string }>
   */
  signAuthEntry(
    authEntry: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }>;

  /**
   * A function to request a wallet to sign an AuthEntry XDR.
   *
   * @param message - An arbitrary string rather than a transaction or auth entry
   * @param opts - Options compatible with https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md#signmessage
   * @param opts.networkPassphrase - The Stellar network to use when signing
   * @param opts.address - The public key of the account that should be used to sign
   * @param opts.path - This options is added for special cases like Hardware wallets
   *
   * @return - Promise<{ signedMessage: string; signerAddress: string }>
   */
  signMessage(
    message: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ): Promise<{ signedMessage: string; signerAddress?: string }>;

  /**
   * A function to request the current selected network in the wallet. This comes
   * handy when you are dealing with a wallet that doesn't allow you to specify which network to use (For example Lobstr and Rabet)
   *
   * @return - Promise<{ network: string; networkPassphrase: string }>
   */
  getNetwork(): Promise<{ network: string; networkPassphrase: string }>;

  /**
   * This method should be included if your wallet have some sort of async connection, for example WalletConnect
   * Once this method is called, the module should clear all connections
   */
  disconnect?(): Promise<void>;
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
   * Your wallet/library needs to be able to answer this function in less than 500ms.
   * Otherwise, the kit will show it as unavailable
   *
   */
  isAvailable(): Promise<boolean>;
}
