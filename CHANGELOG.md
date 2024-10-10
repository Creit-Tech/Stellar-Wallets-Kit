# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
