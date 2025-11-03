# Installing the library

The library is hosted in a [JSR repository](https://jsr.io/@creit-tech/stellar-wallets-kit), install it with the
command:

```shell
npx jsr add @creit-tech/stellar-wallets-kit
```

```shell
pnpm add jsr:@creit-tech/stellar-wallets-kit
```

```shell
deno add jsr:@creit-tech/stellar-wallets-kit
```

```shell
yarn add jsr:@creit-tech/stellar-wallets-kit
```

```shell
bunx jsr add @creit-tech/stellar-wallets-kit
```

## Users updating from V1

The first version of the library was hosted in [NPM](https://www.npmjs.com/package/@creit.tech/stellar-wallets-kit) with
a different workspace: `@creit.tech` vs the new `@creit-tech` user in JSR. To be compatible with old installations we
are also pushing new code to the NPM package but be aware that at some point we will stop doing it, we suggest migrating
to the new JSR workspace.
