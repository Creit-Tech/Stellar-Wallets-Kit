---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Stellar Wallets Kit"
  text: "All Stellar Wallets with just one library"
  tagline: Forget about reading the wallets' documentation, just support all of them at once with this kit.
  image:
    src: /auth-modal.png
    alt: Auth modal
  actions:
    - theme: brand
      text: Get started
      link: /#getting-started
    - theme: alt
      text: Documentation
      link: /installation

features:
  - title: Framework Agnostic
    details: No matter if you're using React, Angular, Vue or even vanilla! Our library works everywhere (default modules).
  - title: Active Support
    details: We are the same creators of xBull Wallet and other Stellar libraries, so we are constantly using and improving our own libraries.
  - title: Custom Themes
    details: Define the theme of the kit's components so it feels just like your website, users probably won't know you are using a library ;)
---

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

You need something more complex? Maybe listening to updates from the kit or manually handling the connection yourself?
Check
the [documentation](/installation) for more details.

## Compatible Wallets:

- xBull Wallet (Both PWA and extension version)
- Albedo
- Freighter
- Rabet (extension version)
- WalletConnect
- Lobstr
- Hana
- Hot Wallet
- Klever Wallet

## Who is using the kit?

If you would like to see the kit in action, check these websites that are already using it:

- https://lab.stellar.org/
- https://swap.xbull.app/
- https://mainnet.blend.capital/
- https://app.fxdao.io/
- https://app.sorobandomains.org/
