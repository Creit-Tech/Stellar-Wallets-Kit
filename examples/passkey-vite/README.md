# Passkey wallet reference app

Registers a passkey wallet in the Stellar Wallets Kit picker next to Freighter, LOBSTR and
xBull, and drives every call through `StellarWalletsKit` rather than the module directly.

## Run it

`@soropass/core` installs from npm (`^0.3.1`). The kit itself is linked from the local
npm build (`@creit-tech/stellar-wallets-kit` resolves to `../../src/dist`) because the
`PasskeyModule` is not in a published kit release yet. Build the kit first, then install
and run:

```bash
# 1. build the kit npm package (includes the PasskeyModule)
cd src && deno task build-npm

# 2. run the app
cd ../examples/passkey-vite
pnpm install --ignore-workspace
pnpm dev            # http://localhost:5273
```

Rebuild step 1 whenever you change the module; the `link:` dependency picks the new build
up on the next `pnpm dev`.

## What the page is

A five-step test run a person follows in order, on testnet, through the kit's own modal:

1. Connect through the kit picker (Passkey next to Freighter, LOBSTR, xBull; the OS sheet; a C-address deployed through the factory).
2. Sign a transaction (the passkey authorizes `add_signer`; testnet reports SUCCESS).
3. Reject a wrong key (the same transaction signed with a random software key; the contract's `__check_auth` rejects it on-chain).
4. Disconnect, then reconnect (same address, no new account).
5. Come back as a returning visitor (reload; the address is derived offline, with no OS sheet and no RPC call; the page counts both).

Each step is a button followed by its checks, which the page verifies itself (an address came back, testnet reported SUCCESS, zero RPC calls). A step passes when every check is green; **Flag a problem** fails it regardless, with a note for what you saw. The page keeps the evidence (address, transaction hash, timing, Stellar Expert links) next to each step. Results persist in the browser; **Reset and start over** in the Session card forgets the run, the credential and the fee source and reloads for a true first run.

**Other kit calls** covers the rest of the module surface, one row per call with the kit's response under it: `signAuthEntry`, `signMessage`, a silent `getAddress`, the profile modal, and resetting the stored credential for a true first run.

## Networks and modes

The page runs on testnet. It creates a throwaway friendbot-funded account in `sessionStorage` to pay fees, deploys a smart account through the factory at `CADKKP4BEFTZYK3NDGSBTPDJESPNRQ6HF36XAT62WQUPI47MNTENY3NH` (the `@soropass/core` default for testnet), and submits real transactions. The funding account holds nothing worth keeping. The transaction the passkey authorizes is `add_signer` (enrolling a new device key), the account's own auth-gated call, which needs no XLM in the account itself.

The module is network-agnostic. To point the example at another network, set the factory id and a fee-source strategy suited to it (a relayer or the app's own sponsor account rather than a browser-held secret) in `src/backends.ts`.

Two more modes exist for the automated suite only, selected with `?mode=` and never offered in the UI:

| Mode | Accounts | Authenticator | Network |
|---|---|---|---|
| `?mode=mock` | in memory | in-process, deterministic | none |
| `?mode=local` | in memory | real WebAuthn (or a CDP virtual authenticator) | none |

Steps 3 and 5 need the chain and are disabled in those modes.

## Testing on a phone

WebAuthn needs a secure context, and the RP ID is the page's hostname. Expose the dev server
over https with a tunnel and open that URL on the phone:

```bash
pnpm dev --host
npx localtunnel --port 5273     # or cloudflared / ngrok
```

A passkey created on one origin does not work on another, so use one URL for the whole session.

## Automated tests

```bash
pnpm exec playwright test
```

12 tests in Chromium drive the modal with a CDP virtual authenticator in `?mode=local`; 3 more
run in each of Firefox and WebKit. They cannot cover a real authenticator, a phone, a security
key, or the chain, which is what the five steps on the page are for. Run them in Safari,
Firefox, on a phone, or with a security key by opening the page there.
