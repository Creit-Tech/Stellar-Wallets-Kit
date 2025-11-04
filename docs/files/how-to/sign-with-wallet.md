# Get a signature

If you need to request the user to sign a transaction, an auth entry or a message you can do it with three different
methods. Call them like this:

```typescript
const {signedTxXdr} = await StellarWalletsKit.signTransaction(tx.toXDR(), {
  networkPassphrase: Networks.PUBLIC,
  address: 'THE_STELLAR_ADDRESS',
});
```

> IMPORTANT: Not all wallets support all methods, for example you can not request to sign a message or an authorization
> entry with Wallet Connect.

These are the current methods the kit support related to signatures:

```typescript
interface StellarWalletsKit {
  signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string; },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }>;

  signAuthEntry(
    authEntry: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }>;

  signMessage(
    message: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedMessage: string; signerAddress?: string }>
}
```
