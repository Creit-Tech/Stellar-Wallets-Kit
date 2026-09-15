import {
  Asset,
  Keypair,
  type Memo,
  MemoHash,
  MemoID,
  MemoReturn,
  MemoText,
  type Transaction,
} from "@stellar/stellar-sdk";
import { encodeHex } from "@std/encoding";

/**
 * Builds the `{ path, networkPassphrase, transaction }` payload that
 * `TrezorConnect.stellarSignTransaction` expects, field by field.
 *
 * This replaces `@trezor/connect-plugin-stellar`'s `transformTransaction`. That function reads
 * offer prices via a `xdrOperation.body().value().price().n()/.d()` method-chain, which
 * `@stellar/stellar-sdk` v17 (built on `@stellar/js-xdr` v5) no longer supports: `body`, `value`,
 * `price`, `n` and `d` all became plain readonly properties. It throws for `manageBuyOffer`,
 * `manageSellOffer`, and `createPassiveSellOffer` transactions as a result. This is a clean-room
 * reimplementation written against the public `TrezorConnect.stellarSignTransaction` param shape
 * (documented in `@trezor/connect`'s own type declarations), not copied from Trezor's source —
 * `@trezor/connect-plugin-stellar` is licensed under Trezor's T-RSL, which doesn't permit
 * redistributing its code outside the company that downloaded it.
 *
 * Along the way this also fixes two smaller v17 fallout bugs the original plugin has: `Buffer`
 * usages (`.toString('hex')`, `instanceof Buffer`) that silently no-op once stellar-sdk hands back
 * plain `Uint8Array`s for signer keys and `manageData` values instead of `Buffer` instances.
 */
export function transformTransaction(
  path: string,
  tx: Transaction,
): { path: string; networkPassphrase: string; transaction: Record<string, unknown> } {
  // `tx.tx` is a getter that re-parses the raw XDR transaction on every access; call it once.
  const rawOperations = tx.tx.operations;

  const operations = tx.operations.map((o, i) => {
    const operation = { ...o } as Record<string, unknown>;

    if (operation.signer) {
      operation.signer = transformSigner(
        operation.signer as {
          ed25519PublicKey?: string;
          preAuthTx?: Uint8Array;
          sha256Hash?: Uint8Array;
          weight?: number;
        },
      );
    }

    if (Array.isArray(operation.path)) {
      operation.path = (operation.path as Asset[]).map(transformAsset);
    }

    if (typeof operation.price === "string") {
      // The JS-level `price` is a lossy decimal (n/d already divided); the exact rational only
      // survives on the raw XDR operation, which is why we go back to `rawOperations` for it.
      const rawOp = rawOperations[i] as unknown as { body: { value: { price: { n: number; d: number } } } };
      const { n, d } = rawOp.body.value.price;
      operation.price = { n, d };
    }

    for (const field of AMOUNT_FIELDS) {
      if (typeof operation[field] === "string") {
        operation[field] = toStroops(operation[field] as string);
      }
    }

    for (const field of ASSET_FIELDS) {
      if (operation[field]) {
        operation[field] = transformAsset(operation[field] as Asset);
      }
    }

    if (operation.type === "allowTrust") {
      operation.assetType = transformAsset(
        new Asset(operation.assetCode as string, operation.trustor as string),
      ).type;
    }

    if (operation.type === "manageData" && operation.value) {
      operation.value = encodeHex(operation.value as Uint8Array);
    }

    if (operation.type === "manageBuyOffer") {
      operation.amount = operation.buyAmount;
      delete operation.buyAmount;
    }

    return operation;
  });

  return {
    path,
    networkPassphrase: tx.networkPassphrase,
    transaction: {
      source: tx.source,
      fee: Number.parseInt(tx.fee, 10),
      sequence: tx.sequence,
      memo: transformMemo(tx.memo),
      timebounds: transformTimebounds(tx.timeBounds),
      operations,
    },
  };
}

/** Fields whose JS-level value is a decimal amount string that Trezor expects as a stroop integer string. */
const AMOUNT_FIELDS = [
  "amount",
  "sendMax",
  "destAmount",
  "sendAmount",
  "destMin",
  "startingBalance",
  "limit",
  "buyAmount",
] as const;

/** Fields whose JS-level value is a stellar-sdk `Asset` that Trezor expects as `{ type, code, issuer }`. */
const ASSET_FIELDS = ["asset", "sendAsset", "destAsset", "selling", "buying", "line"] as const;

/**
 * Converts a decimal amount string to an exact stroop integer string via plain string
 * manipulation (no floating-point, no bignumber dependency). Safe because `@stellar/stellar-sdk`
 * always formats these as `<integer>.<7 digits>` (see `fromXdrAmount`'s `toFixed(7)`).
 */
function toStroops(decimal: string): string {
  const [whole, fraction = ""] = decimal.split(".");
  const paddedFraction = fraction.padEnd(7, "0").slice(0, 7);
  const combined = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, "");
  return combined.length > 0 ? combined : "0";
}

function transformAsset(asset: Asset): { type: number; code?: string; issuer?: string } {
  if (asset.isNative()) {
    return { type: 0, code: asset.getCode() };
  }
  return {
    type: asset.getAssetType() === "credit_alphanum4" ? 1 : 2,
    code: asset.getCode(),
    issuer: asset.getIssuer(),
  };
}

function transformSigner(
  signer: { ed25519PublicKey?: string; preAuthTx?: Uint8Array; sha256Hash?: Uint8Array; weight?: number },
): { type: number; key?: string; weight?: number } {
  let type = 0;
  let key: string | undefined;

  if (signer.ed25519PublicKey) {
    key = encodeHex(Keypair.fromPublicKey(signer.ed25519PublicKey).rawPublicKey());
  }
  if (signer.preAuthTx instanceof Uint8Array) {
    type = 1;
    key = encodeHex(signer.preAuthTx);
  }
  if (signer.sha256Hash instanceof Uint8Array) {
    type = 2;
    key = encodeHex(signer.sha256Hash);
  }

  return { type, key, weight: signer.weight };
}

function transformMemo(
  memo: Memo,
): { type: number; text?: string; id?: string; hash?: string } {
  switch (memo.type) {
    case MemoText:
      return {
        type: 1,
        text: typeof memo.value === "string" ? memo.value : new TextDecoder().decode(memo.value as Uint8Array),
      };
    case MemoID:
      return { type: 2, id: memo.value as string };
    case MemoHash:
      return { type: 3, hash: encodeHex(memo.value as Uint8Array) };
    case MemoReturn:
      return { type: 4, hash: encodeHex(memo.value as Uint8Array) };
    default:
      return { type: 0 };
  }
}

function transformTimebounds(
  timeBounds?: { minTime: string; maxTime: string },
): { minTime: number; maxTime: number } | undefined {
  if (!timeBounds) return undefined;
  return {
    minTime: Number.parseInt(timeBounds.minTime, 10),
    maxTime: Number.parseInt(timeBounds.maxTime, 10),
  };
}
