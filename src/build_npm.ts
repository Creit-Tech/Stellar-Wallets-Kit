import { build, emptyDir } from "@deno/dnt";

await emptyDir("./dist");

await build({
  esModule: true,
  scriptModule: false,
  packageManager: "pnpm",
  entryPoints: [
    "./mod.ts",
    {
      name: "./components",
      path: "./components/mod.ts",
    },
    {
      name: "./state",
      path: "./state/mod.ts",
    },
    {
      name: "./types",
      path: "./types/mod.ts",
    },
    {
      name: "./sdk",
      path: "./sdk/mod.ts",
    },
    {
      name: "./modules/albedo",
      path: "./sdk/modules/albedo.module.ts",
    },
    {
      name: "./modules/freighter",
      path: "./sdk/modules/freighter.module.ts",
    },
    {
      name: "./modules/hana",
      path: "./sdk/modules/hana.module.ts",
    },
    {
      name: "./modules/hotwallet",
      path: "./sdk/modules/hotwallet.module.ts",
    },
    {
      name: "./modules/klever",
      path: "./sdk/modules/klever.module.ts",
    },
    {
      name: "./modules/ledger",
      path: "./sdk/modules/ledger.module.ts",
    },
    {
      name: "./modules/lobstr",
      path: "./sdk/modules/lobstr.module.ts",
    },
    {
      name: "./modules/rabet",
      path: "./sdk/modules/rabet.module.ts",
    },
    {
      name: "./modules/trezor",
      path: "./sdk/modules/trezor.module.ts",
    },
    {
      name: "./modules/wallet-connect",
      path: "./sdk/modules/wallet-connect.module.ts",
    },
    {
      name: "./modules/xbull",
      path: "./sdk/modules/xbull.module.ts",
    },
    {
      name: "./modules/utils",
      path: "./sdk/modules/utils.ts",
    },
  ],
  outDir: "./dist",
  shims: {
    deno: false,
  },
  typeCheck: false,
  package: {
    name: "@creit-tech/stellar-wallets-kit",
    version: "2.0.0",
    description: "A kit to handle all Stellar Wallets at once",
    author: {
      name: "Creit Technologies LLP",
      url: "https://creit.tech",
    },
    license: "MIT",
    repository: {
      type: "git",
      url: "https://github.com/Creit-Tech/Stellar-Wallets-Kit.git",
    },
    keywords: [
      "Stellar",
      "Stellar Wallets",
      "Wallet",
      "Wallets",
      "Albedo",
      "xBull Wallet",
      "Rabet",
      "Freighter",
    ],
  },
});
