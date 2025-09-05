import { build, emptyDir } from "@deno/dnt";

await emptyDir("./dist");

await build({
  esModule: true,
  scriptModule: false,
  packageManager: "pnpm",
  entryPoints: ["./mod.ts"],
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
