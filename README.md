# Stellar Wallets Kit

A kit to handle all Stellar Wallets at once with a simple API and without caring about individual configurations for
each one of them. This library cares only about the connection and interaction with the wallets, allowing developers
handling the UI/UX in the way they want.

## Getting started

You can use our library and interact with wallets in multiple ways, here is the shortest way but depending on the logic
of you app you might need to do something different, check the documentation for more details.

Here are the steps to install, start and sign a transaction with our kit:

### Install the package

```shell
npx jsr add @creit-tech/stellar-wallets-kit
```

### Start the kit

```typescript
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';

StellarWalletsKit.init({modules: defaultModules()});
```

### Create the authentication button

```typescript
const buttonWrapper = document.querySelector('#buttonWrapper');
StellarWalletsKit.createButton(buttonWrapper);
```

### Sign a transaction

```typescript
const {address} = await StellarWalletsKit.getAddress();

const {signedTxXdr} = await StellarWalletsKit.signTransaction(tx.toXDR(), {
  networkPassphrase: Networks.PUBLIC,
  address,
});

console.log("Signed Transaction:", signedTxXdr);
```

And that's it! you just added support to all Stellar wallets and signed a transaction that is ready to go to the public
network with just a few lines of code 🙌

You need something more complex? Maybe listening to updates from the kit or manually handling connection yourself? Check
out the [documentation](https://stellarwalletskit.dev/) for more details.

## Compatible Wallets:

- xBull Wallet (Both PWA and extension version)
- Albedo
- Freighter (extension and mobile)
- Rabet (extension version)
- WalletConnect
- Lobstr
- Hana
- Hot Wallet
- Klever Wallet

## Installation and usage

Check how to install and use our library in our documentation at https://stellarwalletskit.dev

## Who is using the kit?

If you would like to see the kit in action, check these websites that are already using it:

- https://lab.stellar.org/
- https://swap.xbull.app/
- https://mainnet.blend.capital/
- https://app.fxdao.io/
- https://app.sorobandomains.org/
- https://stellar.cables.finance/

## License

![](https://img.shields.io/badge/License-MIT-lightgrey)

Licensed under the MIT License, Copyright © 2023-present Creit Technologies LLP.

Checkout the `LICENSE.md` file for more details.


