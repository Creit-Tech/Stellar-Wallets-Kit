# Kit events

You can listen to updates from the kit, like for example if the user has disconnected from the kit, if it updated the
address or picked another wallet. To do that, use the `on` method of the kit like this:

```typescript
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";

const sub = StellarWalletsKit.on(KitEventType.STATE_UPDATED, event => {
  console.log(`Address updated:`, event.payload.address);
});

// To unsubscribe from the updates, do this: `sub()`
```

The available event types and expected payloads are:

```typescript
export enum KitEventType {
  STATE_UPDATED = "STATE_UPDATE",
  WALLET_SELECTED = "WALLET_SELECTED",
  DISCONNECT = "DISCONNECT",
}

export type KitEventStateUpdated = {
  eventType: KitEventType.STATE_UPDATED;
  payload: {
    address: string | undefined;
    networkPassphrase: string;
  };
};
export type KitEventWalletSelected = {
  eventType: KitEventType.WALLET_SELECTED;
  payload: {
    id: string | undefined;
  };
};
export type KitEventDisconnected = {
  eventType: KitEventType.DISCONNECT;
  payload: Record<PropertyKey, never>;
};

export type KitEvent = KitEventStateUpdated | KitEventWalletSelected | KitEventDisconnected;
```
