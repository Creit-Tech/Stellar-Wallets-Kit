A kit to handle all Stellar Wallets at once with a simple API and without caring about individual configurations for each one of them. This library cares only about the connection and interaction with the wallets, allowing developers handling the UI/UX in the way they want.

## Compatible Wallets:

- xBull Wallet (Both PWA and extension version)
- Albedo
- Freighter
- Rabet (extension version)

## Installation

```shell
npm i @creit.tech/stellar-wallets-kit
```

## The StellarWalletsKit class

The first step will be creating a new instance from the main class, you should only create one instance in order to avoid unexpected results.

```typescript
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  XBULL_ID
} from '@creit.tech/stellar-wallets-kit';

const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: XBULL_ID,
  modules: allowAllModules(),
});
```

> The `allowAllModules()` function doesn't import those modules where you need to provide a configuration (like WalletConnect), you will need to add them manually so check the folder `src/modules` to know all the available modules. 

If you want to specify only the wallets you want to support, you can start the kit with only those by sending the modules to the constructor like this:

```typescript
import {
  FreighterModule,
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  xBullModule
} from '@creit.tech/stellar-wallets-kit';

const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: XBULL_ID,
  modules: [
    new xBullModule(),
    new FreighterModule(),
  ]
});
```

## Integrated UI modal

![](./modal-ui.gif)

The library integrates a UI modal you can show your users after you have started the kit. Once they pick the wallet they want to use you can then use the other methods available. Here is how you can use it:
```typescript
await kit.openModal({
  onWalletSelected: async (option: ISupportedWallet) => {
    kit.setWallet(option.id);
    const publicKey = await kit.getPublicKey();
    // Do something else
  }
});
```

And as simple as that you will give full support to all the Stellar wallets plus you don't even need to handle the modal UI yourself. 

The `openModal` method also lets you update multiple things about the model like the title, the allowed wallets or even the styles of it! Here are the accepted parameters:

```typescript
function openModal(params: {
    onWalletSelected: (option: ISupportedWallet) => void;
    onClosed?: (err: Error) => void;
    modalDialogStyles?: { [name: string]: string | number | undefined | null; }
    modalTitle?: string;
    notAvailableText?: string;
}) {}
```


## Request the public key and sign transactions

Each wallet has its own way when it comes to both requesting the public key and signing a transaction. Using this kit you can do both actions with a unified API:
```typescript
const publicKey = await kit.getPublicKey();

// AND

const { result } = await kit.signTx({
  xdr: '....',
  publicKeys: [publicKey], // You could send multiple public keys in case the wallet needs to handle multi signatures
  network: WalletNetwork.PUBLIC
});
```

Both methods will trigger the action using the wallet you have set before calling those methods.
 
## Extra methods

There will be moments where you would like to change certain parameters from the kit like the selected wallet, the network, etc... or maybe listening when a WalletConnect session was removed. These methods will help you in those situations: 

### Set the target wallet

```typescript
await kit.setWallet(XBULL_ID)
```

### Set the target network

```typescript
await kit.setNetwork(WalletNetwork.TESTNET);
```

And more methods, check the documentation to see all the methods available.

## License
![](https://img.shields.io/badge/License-MIT-lightgrey)

Licensed under the MIT License, Copyright © 2023-present Creit Technologies LLP.

Checkout the `LICENSE.md` file for more details.


