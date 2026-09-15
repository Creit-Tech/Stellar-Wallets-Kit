/// <reference lib="deno.ns" />
import { assertEquals } from "jsr:@std/assert@1";
import {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  type Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { transformTransaction } from "./trezor-transform.ts";

/**
 * Regression coverage for the bug this file resolves: `@stellar/stellar-sdk` v17 rebuilt its XDR
 * layer (`@stellar/js-xdr` v5), turning `xdrOperation.body().value().price().n()/.d()` from a
 * method-chain into plain readonly properties. `@trezor/connect-plugin-stellar`'s
 * `transformTransaction` still uses the old method-chain style and throws
 * (`xdrOperation.body is not a function`) for `manageBuyOffer`/`manageSellOffer`/
 * `createPassiveSellOffer` as a result — this local reimplementation fixes that.
 */

const BUYING_ASSET = new Asset("USD", "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37");
const PATH = "m/44'/148'/0'";

function buildTx(operation: ReturnType<typeof Operation.manageSellOffer>): Transaction {
  const source = Keypair.random();
  const account = new Account(source.publicKey(), "1");
  return new TransactionBuilder(account, { fee: "100", networkPassphrase: Networks.TESTNET })
    .addOperation(operation)
    .setTimeout(30)
    .build() as Transaction;
}

Deno.test("transformTransaction(): manageSellOffer resolves the exact rational price (not a lossy decimal) without throwing", () => {
  const tx = buildTx(
    Operation.manageSellOffer({
      selling: Asset.native(),
      buying: BUYING_ASSET,
      amount: "10",
      price: { n: 3, d: 7 },
    }),
  );

  const result = transformTransaction(PATH, tx);
  const op = result.transaction.operations as Array<Record<string, unknown>>;

  assertEquals(op[0].price, { n: 3, d: 7 });
  assertEquals(op[0].amount, "100000000");
});

Deno.test("transformTransaction(): manageBuyOffer resolves the exact rational price and renames buyAmount to amount", () => {
  const tx = buildTx(
    Operation.manageBuyOffer({
      selling: Asset.native(),
      buying: BUYING_ASSET,
      buyAmount: "10",
      price: { n: 5, d: 11 },
    }),
  );

  const result = transformTransaction(PATH, tx);
  const op = result.transaction.operations as Array<Record<string, unknown>>;

  assertEquals(op[0].price, { n: 5, d: 11 });
  assertEquals(op[0].amount, "100000000");
  assertEquals(op[0].buyAmount, undefined);
});

Deno.test("transformTransaction(): createPassiveSellOffer resolves the exact rational price without throwing", () => {
  const tx = buildTx(
    Operation.createPassiveSellOffer({
      selling: Asset.native(),
      buying: BUYING_ASSET,
      amount: "1",
      price: { n: 1, d: 2 },
    }),
  );

  const result = transformTransaction(PATH, tx);
  const op = result.transaction.operations as Array<Record<string, unknown>>;

  assertEquals(op[0].price, { n: 1, d: 2 });
});

Deno.test("transformTransaction(): unaffected operation types (payment) still transform correctly", () => {
  const tx = buildTx(
    Operation.payment({
      destination: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
      asset: Asset.native(),
      amount: "42.5",
    }),
  );

  const result = transformTransaction(PATH, tx);
  const op = result.transaction.operations as Array<Record<string, unknown>>;

  assertEquals(op[0].type, "payment");
  assertEquals(op[0].amount, "425000000");
  assertEquals(op[0].asset, { type: 0, code: "XLM" });
});
