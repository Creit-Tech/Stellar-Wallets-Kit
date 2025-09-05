# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.9.5](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.9.4...v1.9.5) (2025-09-05)
### Add
- Update the supported wallets everytime the modal is opened instead of just when the kit instance is created

### [1.9.4](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.9.3...v1.9.4) (2025-09-05)
### Change
- Upgrade Freighter's module so it handles the two different ways Freighter answer to the signMessage method.

### [1.9.3](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.9.2...v1.9.3) (2025-09-03)
### Change
- Upgrade Freighter API's library to latest

### Fix
- Update the types in kit's class so it includes the new `skipRequestAccess` parameter

### [1.9.2](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.9.1...v1.9.2) (2025-09-02)
### Add
- Include a `skipRequestAccess` parameter for devs that need to ignore the `requestAccess` to freighter when calling the `getAddress` method.

### [1.9.1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.9.0...v1.9.1) (2025-08-26)
### Change
- Downgrade Albedo library to 0.12.0

### [1.9.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.8.0...v1.9.0) (2025-08-25)
### add
- Add a new `isPlatformWrapper` logic so modules can check if they are the ones that will be used by the user without the need of the user manually picking it.
- Klever wallet module

### Change
- Update @stellar/stellar-sdk version to latest
- Update Trezor library
- Update Albedo library

### [1.8.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.7.7...v1.8.0) (2025-08-13)
### add
- xBull message signing logic
- Upgrade xBull Wallet Connect library version

### [1.7.7](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.7.6...v1.7.7) (2025-07-28)
### Fix
- Allow scrolling the modal (needed for small screens)

### [1.7.6](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.7.5...v1.7.6) (2025-07-10)
### Fix
- Make the `isAvailable` method for Rabet and Hana so it has a small delay to avoid checking before the extensions have placed the window object

### [1.7.5](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.7.3...v1.7.5) (2025-06-03)
### Add
- Include a new `sep43Modules` function that returns a list of only wallets that follow all the SEP-0043 methods
- Add a new `filterBy` parameter for both `allowAllModules` and `sep43Modules`

### Change
- Make optional providing the default module when starting the kit and instead throw an error if someone tries to use one module before it has been selected.

### [1.7.3](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.7.2...v1.7.3) (2025-03-17)
### Change
- Change dist files so we use .mjs instead of .js, that way Next understands it needs to use the ESM version instead of the commonjs version.

### [1.7.2](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.7.1...v1.7.2) (2025-03-14)
### Fix
- Do not show the account selector modal if the dev is passing a path for the Ledger module's method `getAddress`

### [1.7.1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.7.0...v1.7.1) (2025-03-06)
### add
- Include a new `onError` parameter to the `createButton` method so developers can listen to possible errors when getting the public key from the contract.

### [1.7.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.6.1...v1.7.0) (2025-03-06)
### add
- Include a new `onClosed` parameter to the `createButton` method so developers can listen to the closed event the modal triggers.

### Change
- Upgrade the Trezor library to latest one

### [1.6.1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.6.0...v1.6.1) (2025-02-24)
### Add
- Fix the `getAddress` method in the Freighter module, the address was being returned as a blank string. It was reported in this [ticket](https://github.com/Creit-Tech/Stellar-Wallets-Kit/issues/57).

### [1.6.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.5.0...v1.6.0) (2025-02-21)
### Add
- Add module for HOT wallet

### [1.5.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.4.1...v1.5.0) (2025-02-20)
### Add
- Add method "assignButtons" to the kit

### [1.4.1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.4.0...v1.4.1) (2025-01-09)
### Fix
- Make the Trezor module to work with Webpack projects

### [1.4.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.3.0...v1.4.0) (2024-12-20)
### Add
- Add Trezor wallets support
- Update the returned value from the `openAccountSelector` method in the Ledger module.

### [1.3.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.2.5...v1.3.0) (2024-12-05)
### Add 
- Add Ledger wallets support
- Add new "account selector" component which can be used by wallets based on mnemonic phrases or similar (for example hardware wallets)
- Merge PR #48 - Add signMessage support for Hana wallet

### [1.2.5](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.2.3...v1.2.5) (2024-11-07)
### Fix
- Add `Buffer` package to correctly convert the response from a signed message/auth entry with Freighter ([Ticket created](https://github.com/stellar/freighter/issues/1626))
- Check if `window` is `undefined` before using it with Rabet and Hana so it works on server side flows.

### [1.2.3](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.2.2...v1.2.3) (2024-10-09)
### Fix
- Move the Modal component out from the Button component, we do this so the shadow DOM styles don't affect the modal component in those cases where there is a container that could prevent the modal from taking the whole screen

### [1.2.2](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.2.1...v1.2.2) (2024-10-07)
### Add
- Add `removeButton` and `isButtonCreated` methods to the kit. These methods can be used in cases where we need to re-organize the layout of our frontend

### [1.2.1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.2.0...v1.2.1) (2024-09-15)
### Change
- Use xBull Wallet Connect npm package instead of the github version, this way some lints don't trigger an error.

### [1.2.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.1.0...v1.2.0) (2024-08-24)
### Add
- Add a `disconnect` method to the `KitActions` interface.
- Update `WalletConnect` module so it accepts a `onSessionDeleted` parameter.

### Change
- Upgrade all dependencies, lock them and remove those that are not used anymore.

### [1.1.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v1.0.0...v1.1.0) (2024-08-22)
### Add
- Add the latest version of the Freighter API and update the calls to the API.
- Add a new `Button` component. This new component can show the selected address, and the current XLM balance allows copying the chosen address and allows the user to "disconnect".
- Allow listening to both "connect" and "disconnect" Button events
- Add a new state to the kit, so we can keep the current balance and picked address to show in the Button component.
- Add a new plugin to the build process, so it minimizes the distribution build.
- Add a new development server to make the development of the kit easier.

### [1.0.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.9.2...v1.0.0) (2024-08-11)
### Change
- BREAKING: Update all the kit interface to support [SEP-0043](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md).
- Transform all images from .svg to .png so sites not allowing that format can load the images.

### [0.9.2](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.9.1...v0.9.2) (2024-07-27)
### Change
- Merge of PR [#33](https://github.com/Creit-Tech/Stellar-Wallets-Kit/pull/33) which allows defining a custom theme to the kit's modal
- Improve the custom theme feature so it allows more customization, also include default themes so users can use them directly if they want to 

### [0.9.1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.9.0...v0.9.1) (2024-07-02)
### Change
- The list of wallets on the modal will now dynamically change its order based on the criteria here: https://github.com/Creit-Tech/Stellar-Wallets-Kit/issues/28 

### [0.9.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.8.3...v0.9.0) (2024-06-22)
### Change
- Allow passing a wallet connect client and modal to the kit
- Update Lit to 2.8.0
- Move to a Rollup bundle strategy so the kit is compatible with both Commonjs and ES Module projects
- BREAKING: Moved from "build" distribution folder to a root style distribution
- BREAKING: Wallet connect packages are no longer exported from the root file, import from `modules/walletconnect.module.ts` instead.

### [0.8.3](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.8.2...v0.8.3) (2024-06-05)
### Add
- Merge pull #22 and add Hana Wallet to the Kit

### Change
- Update Github action to move from npm to pnpm and be able to remove the package-lock file

### [0.8.2](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.8.1...v0.8.2) (2024-05-28)
### Change
- Change the way we request the public key from Freighter (instead of using `getPublicKey` we now use `requestAccess` because otherwise we could receive an empty string)

### [0.8.1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.8.0...v0.8.1) (2024-05-03)
### Add
- Introduce a timer to function `isAvailable` so `getSupportedWallets` doesn't take too much

### Change
- Update Lobstr name to LOBSTR
- Lock and update dependencies versions

### [0.8.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.7.0...v0.8.0) (2024-04-16)
### Add
- Add Lobstr extension support

### [0.7.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.6.1...v0.7.0) (2024-03-15)
### Add
- Bring back Wallet Connect module

### Delete
- Demo page and dependencies for it

### [0.6.1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.6.0...v0.6.1) (2024-02-16)

### Change
- Get rid of the "build/main" folder for better compatibility with projects using this kit

### [0.6.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.5.0...v0.6.0) (2024-02-15)
### Add
- A new bundled version of the kit is available at /build/web-bundle.js

### Change
- The UI has been updated, so it now has a mobile version and show a quick and basic explanation of what a wallet it.
- Now when clicking on a wallet that is not installed, it will open the official wallet website.

### [0.5.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.2.0...v0.5.0) (2024-01-12)
#### Change
- Wallets/services are now handled as "modules" (a module is basically a driver for a wallet/service) and they all share a common interface. This way wallets' developers can create their own modules and make their products compatible with this kit.
- BREAKING: Modules now need to be imported when starting the kit, a function called `allowAllModules` is included and this one will inject all the builtin modules 
- BREAKING: When creating a new instance of `StellarWalletsKit`, you now send the wallet id (provided either by this kit or by the third party module) instead of `WalletType`.
- BREAKING: When using the modal, you need to pass the id of the selected wallet instead of the type. Check `README.md` for an example
- BREAKING: `allowedWallets` is no longer a valid parameter for the integrated modal, instead the modal uses the modules from the kit.
- BREAKING: WalletConnect support has been dropped, the integration got outdated and needs to be upgraded before we add it again.

### [0.2.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.1.4...v0.2.0) (2024-01-12)
#### Change
- Move away from Github distribution to a classic npm package distribution

### [0.1.4](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.1.3...v0.1.4) (2023-11-16)
#### Change
- Upgrade xBull-Wallet-connect library to the latest one

### [0.1.3](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.1.1...v0.1.3) (2023-11-16)
#### add
- Fix height issues (ios devices)

### [0.1.2](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.1.0...v0.1.2) (2023-09-30)
#### add
- New version of the Freighter API (1.7.0)
- Merge PR [#4](https://github.com/Creit-Tech/Stellar-Wallets-Kit/pull/4)

### [0.1.1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.1.0...v0.1.1) (2023-08-04)
#### add
- New version of the Freighter API (1.6.0) which includes the new support to signing Blobs
- Merge of PRs [#1](https://github.com/Creit-Tech/Stellar-Wallets-Kit/pull/1), [#2](https://github.com/Creit-Tech/Stellar-Wallets-Kit/pull/2) and [#3](https://github.com/Creit-Tech/Stellar-Wallets-Kit/pull/3) which they include the support of Blob signing for Freighter

### [0.1.0](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.0.8...v0.1.0) (2023-06-03)
#### add
- Add new modal component integrated with the wallet kit

### [0.0.8](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.0.7...v0.0.8) (2023-05-30)
#### Change
- Upgrade the packages to support the latest Freighter wallet

### [0.0.7](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.0.6...v0.0.7) (2023-04-27)
#### Change
- Fix XDR returned from Albedo didn't include the signatures

### [0.0.6](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.0.5...v0.0.6) (2023-02-06)
#### Change
- Method `getSupportedWallets`is now static

### [0.0.5](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.0.4...v0.0.5) (2022-11-23)
#### Add
- Add method `closeSession` to allow disconnecting WalletConnect sessions from the kit

### [0.0.4](https://github.com/Creit-Tech/Stellar-Wallets-Kit/compare/v0.0.2...v0.0.4) (2022-11-18)
#### Add
- Add method `getSupportedWallets`

### 0.0.3 (2022-11-17)
#### Notes
- First day of deployment
