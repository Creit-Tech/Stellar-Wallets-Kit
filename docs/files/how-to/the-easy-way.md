# The easy way

Before we go into more details about what each method of the kit does, we wanted to show you which method we recommend
and the one that should make the process easier for you.

## Step 1: Start the kit

The first step is, of course, starting the kit. Make sure you do this in a browser environment, so if, for example, your
site uses SSR or has a pre-rendering process, then skip starting the kit until you know it's in the browser. Once you
know, you can start it. Do it like this:

```typescript
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { SwkAppDarkTheme } from "@creit-tech/stellar-wallets-kit/types";
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';

StellarWalletsKit.init({
  theme: SwkAppDarkTheme,
  modules: defaultModules(),
});
```

At this point, the kit will be ready to be used, but keep in mind that the default list of modules doesn't include all
the wallets. Please check [this page](/wallets/supported-wallets) if you need to learn how to include all of them.

## Step 2: Insert the built-in connection button

Now that the kit is ready, insert the built-in button, which will take care of opening the authentication modal or the
profile modal based on the current kit's state. This is the button your users will click when they want to connect their
wallets:

```typescript
// First fetch the html element that will contain it
const buttonWrapper = document.querySelector('#buttonWrapper');
// Then insert the button
StellarWalletsKit.createButton(buttonWrapper);
```

This will insert a new component to the website and this component will listen to events from the user and the kit. It
will follow the current theme of the kit so you can update its styles by updating the styles in the kit. Check
the [custom styles](/theme/custom-styles) guide for more details.

Or if you prefer to, you can also just remove all the styles from the button so you can just user regular CSS to update
its appearance like this:

```typescript
import { ButtonMode } from '@creit-tech/stellar-wallets-kit/components';

StellarWalletsKit.createButton(buttonWrapper, {
  mode: ButtonMode.free,
  classes: 'btn btn-primary'
});
```

## Step 3: Listen to the kit's updates

Because you don't know when the user will click on the button we just created, you need to listen to the updates the kit
will send every time something happens. This way, when the user has connected the wallet, you can update it in your
website's logic

```typescript
import { KitEventType } from "@creit-tech/stellar-wallets-kit/types";

const sub1 = StellarWalletsKit.on(KitEventType.STATE_UPDATED, event => {
  // We update our website's logic with the new address: event.payload.address
});

const sub2 = StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
  // We log out the user
});
```

> Be aware that you should call the subscription when you don't longer need them, this will clear the subscription and
> avoid memory leaks.

## Step 4: Do whatever you want

Now that the kit is ready, the user has a button to interact with and you are listening to updates, you can continue
with your website's logic. For example, if the user needs to sign a transaction, you can:

```typescript
 // We fetch the active address just to be sure we have the last one available
const {address} = await StellarWalletsKit.getAddress();

// We request the signature for the transaction `tx` using the PUBLIC network and the address we just fetched.
const {signedTxXdr} = await StellarWalletsKit.signTransaction(tx.toXDR(), {
  networkPassphrase: Networks.PUBLIC,
  address,
});

// Now we just submit the tx to the network
```

And you are ready to go, check the rest of the documentation if you need more options but what you just saw in this page
will cover the vast majority of situations.

