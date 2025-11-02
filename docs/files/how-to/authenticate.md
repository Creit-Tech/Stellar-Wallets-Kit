# "Authenticate" the user (connect a wallet)

Before you can fetch the wallet address or request a signature, you need to let the user pick the wallet they want to
use and connect with it, we call this "authentication" in the idea of allowing the kit to interact with the user's
wallet.

> No special authentication logic is done here besides just requesting access to the wallet in some cases, you still
> should authenticate your users with something extra based on your app's logic.


To do this, you need to show the user the "authentication modal" where the user will pick the wallet they want to
connect. You will get the active address from the wallet after it selects the option. You can do it like this:

```typescript
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";

const {address} = await StellarWalletsKit.authModal();
```

After the user has picked the wallet and you have received the address, the kit will keep it until the user calls the
`disconnect` button from the profile modal. So the next time the user loads the website, you won't need to open the Auth
modal and instead can just request get the address directly.

## Auth modal params

```typescript
export type AuthModalParams = {
  container?: HTMLElement;
};
```

If you want to, you can define the container where the modal should be inserted; most likely, you won't need to do this,
but the option is there in case it is needed.
