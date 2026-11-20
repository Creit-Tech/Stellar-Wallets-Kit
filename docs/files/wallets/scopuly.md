# Scopuly

Scopuly can connect to Stellar Wallets Kit through its injected provider or through WalletConnect.

| Connection | Kit module | Setup |
| --- | --- | --- |
| Browser extension or Scopuly in-app browser | `ScopulyModule` | Included in `defaultModules()`; no extra module configuration |
| WalletConnect | `WalletConnectModule` | Add the module with a Reown project ID and application metadata |

## Browser extension and in-app browser

`ScopulyModule` uses the `window.scopuly` provider injected by the Scopuly browser extension or the Scopuly in-app browser.
The extension connects to a paired Scopuly signer on iOS, Android, or macOS. It does not store secret keys or seed phrases.

To use the extension:

1. Install the extension for your browser from the [Scopuly extension website](https://extension.scopuly.com/).
2. Install or update Scopuly on your signing device and open the app.
3. Pair the extension with Scopuly: scan the pairing QR code with the mobile app, or paste the pairing link into Scopuly for Mac.
4. Open or reload the dApp, choose **Scopuly** in the kit's wallet picker, and approve account access.
5. Review signing requests and approve them on the paired signing device.

Alternatively, open the dApp inside Scopuly's in-app browser to use its injected provider directly.

### Use the default modules

Scopuly is already included in `defaultModules()`:

```typescript
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";
import { Networks } from "@creit-tech/stellar-wallets-kit/types";

StellarWalletsKit.init({ modules: defaultModules(), network: Networks.TESTNET });
```

### Use a custom module list

If you maintain your own module list, add `ScopulyModule` explicitly:

```typescript
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { ScopulyModule } from "@creit-tech/stellar-wallets-kit/modules/scopuly";
import { Networks } from "@creit-tech/stellar-wallets-kit/types";

StellarWalletsKit.init({ modules: [new ScopulyModule()], network: Networks.TESTNET });
```

Choose one initialization approach. Do not add a second `ScopulyModule` alongside `defaultModules()`.

### Connect and sign

After initializing the kit, call the following from a user action. Pass an unsigned transaction XDR built for Testnet:

```typescript
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { Networks } from "@creit-tech/stellar-wallets-kit/types";

async function connectAndSign(xdr: string) {
  const { address } = await StellarWalletsKit.authModal();
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
    address,
  });

  return signedTxXdr;
}
```

The user selects Scopuly in the authentication modal. Signing returns the signed XDR; it does not submit the transaction.
Use the network passphrase that matches your transaction and the user's selected network.

The direct module also implements `signMessage`, `signAuthEntry`, and `signAndSubmitTransaction`.
See [requesting signatures](/how-to/sign-with-wallet) for the kit's method signatures.

## WalletConnect

To connect without the injected provider, configure [WalletConnectModule](/wallets/wallet-connect) with a Reown project ID
and your application's metadata. It is not included in `defaultModules()`.

Choose **WalletConnect** in the kit's wallet picker, then choose Scopuly in the WalletConnect modal and approve the session
in Scopuly. Scopuly is included in the module's default featured wallets; custom `appKitOptions` can override that list.
This flow does not require the Scopuly browser extension.

The injected-provider and WalletConnect paths establish separate connections. Use the kit APIs for the selected module;
do not mix direct `window.scopuly` calls into a WalletConnect session.

## Troubleshooting

- **Scopuly is unavailable:** install and enable the extension, reload the dApp after installation, or open the dApp in
  Scopuly's in-app browser. `ScopulyModule` requires one of these environments.
- **Pairing or signing does not complete:** update and open the Scopuly signer, check its connection, and complete the
  pending approval on the signing device.
- **Scopuly is missing from a custom wallet list:** include `ScopulyModule` or check the filter passed to `defaultModules()`.
- **Using WalletConnect:** configure `WalletConnectModule` separately and follow its setup guide linked above.

## References

- [Installation and setup](https://extension.scopuly.com/)
- [Provider API](https://extension.scopuly.com/docs/provider-api)
- [Browser extension source code](https://github.com/Scopuly/scopuly-browser-extension)
