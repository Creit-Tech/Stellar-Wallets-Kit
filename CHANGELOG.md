# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
