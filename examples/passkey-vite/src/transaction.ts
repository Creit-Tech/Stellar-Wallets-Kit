/**
 * Building a transaction a passkey smart account can authorize.
 *
 * The account is a contract, so it is never the transaction's source. The source is a
 * funded classic account that pays the fee, and the account's authorization travels as a
 * Soroban auth entry inside an InvokeHostFunction operation. That entry is what the
 * passkey signs and what the account's `__check_auth` verifies on-chain.
 */
import { Contract, nativeToScVal, rpc, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { p256 } from "@noble/curves/nist";
import { NETWORK_PASSPHRASE, RPC_URL } from "./backends.ts";

/**
 * Build a transaction the passkey account must authorize, and return an envelope whose
 * auth entry is ready to sign.
 *
 * The v0.2 account's only auth-gated methods are `add_signer` / `remove_signer` (its
 * `protected()` probe was removed for mainnet). `add_signer` is the self-contained proof:
 * it calls `current_contract_address().require_auth()`, so the passkey's `__check_auth`
 * runs on-chain, and it needs no XLM in the account and no trustline. It enrolls a fresh
 * secp256r1 key, which is exactly the multi-device recovery flow (an existing device
 * authorizes a new one). Each run enrolls one more signer, up to the contract's cap of 20.
 *
 * Two adjustments after simulation. The signature expiration is pushed into the future,
 * because the challenge the passkey signs commits to that exact ledger. And the resource
 * budget is inflated, because simulation runs with an unsigned entry and so never pays
 * for the `secp256r1_verify` the real run performs.
 */
export async function buildAddSignerCall(contractId: string): Promise<string> {
  const server = new rpc.Server(RPC_URL);
  const sourceKey = sessionStorage.getItem("swk-passkey-example-source");
  if (!sourceKey) throw new Error("no fee source: switch to testnet mode first");

  const { Keypair } = await import("@stellar/stellar-sdk");
  const source = Keypair.fromSecret(sourceKey);
  const account = await server.getAccount(source.publicKey());

  // A fresh SEC-1 (65-byte) key to enroll as a new signer.
  const newSignerKey = p256.getPublicKey(p256.utils.randomPrivateKey(), false);
  const newSignerArg = nativeToScVal(newSignerKey, { type: "bytes" });

  const tx = new TransactionBuilder(account, { fee: "2000000", networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(new Contract(contractId).call("add_signer", newSignerArg))
    .setTimeout(120)
    .build();

  let sim = await server.simulateTransaction(tx);
  // A just-deployed account can read back as a missing contract instance for a few
  // seconds: the RPC's simulation snapshot lags the ledger that confirmed the deploy.
  // Retry that one case; surface any other simulation error immediately.
  for (let attempt = 0; attempt < 20 && !rpc.Api.isSimulationSuccess(sim); attempt++) {
    if (!JSON.stringify(sim).includes("non-existing value for contract instance")) break;
    await new Promise((r) => setTimeout(r, 1000));
    sim = await server.simulateTransaction(tx);
  }
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error(`simulation failed: ${JSON.stringify(sim)}`);
  }
  const prepared = rpc.assembleTransaction(tx, sim).build();

  const validUntil = (await server.getLatestLedger()).sequence + 1000;
  const envelope = xdr.TransactionEnvelope.fromXDR(prepared.toXDR(), "base64");
  if (envelope.type !== "envelopeTypeTx") throw new Error("expected a v1 envelope");
  const tx0 = envelope.v1.tx;

  // stellar-sdk 17 XDR values are immutable, so the expiration is stamped by
  // rebuilding each auth entry. Protocol 23 simulation returns addressV2
  // credentials; both address variants are stamped, preserving the variant.
  for (const op of tx0.operations) {
    if (op.body.type !== "invokeHostFunction") continue;
    const auth = op.body.invokeHostFunctionOp.auth;
    for (let i = 0; i < auth.length; i++) {
      const creds = auth[i].credentials;
      const addr = creds.type === "sorobanCredentialsAddress"
        ? creds.address
        : creds.type === "sorobanCredentialsAddressV2"
        ? creds.addressV2
        : undefined;
      if (!addr) continue;
      const rebuilt = new xdr.SorobanAddressCredentials({
        address: addr.address,
        nonce: addr.nonce,
        signatureExpirationLedger: validUntil,
        signature: addr.signature,
      });
      auth[i] = new xdr.SorobanAuthorizationEntry({
        credentials: creds.type === "sorobanCredentialsAddressV2"
          ? xdr.SorobanCredentials.sorobanCredentialsAddressV2(rebuilt)
          : xdr.SorobanCredentials.sorobanCredentialsAddress(rebuilt),
        rootInvocation: auth[i].rootInvocation,
      });
    }
  }

  if (tx0.ext.type !== "sorobanData") return envelope.toXDR("base64");
  const sd = tx0.ext.sorobanData;
  const res = sd.resources;
  const bumped = xdr.TransactionEnvelope.envelopeTypeTx(
    new xdr.TransactionV1Envelope({
      tx: new xdr.Transaction({
        sourceAccount: tx0.sourceAccount,
        fee: 10_000_000,
        seqNum: tx0.seqNum,
        cond: tx0.cond,
        memo: tx0.memo,
        operations: tx0.operations,
        ext: xdr.TransactionExt.sorobanData(
          new xdr.SorobanTransactionData({
            ext: sd.ext,
            resources: new xdr.SorobanResources({
              footprint: res.footprint,
              instructions: Math.min(100_000_000, res.instructions * 5 + 30_000_000),
              diskReadBytes: res.diskReadBytes,
              writeBytes: res.writeBytes,
            }),
            resourceFee: 9_000_000n,
          }),
        ),
      }),
      signatures: envelope.v1.signatures,
    }),
  );
  return bumped.toXDR("base64");
}

/** Add the fee source's own signature to an envelope whose auth entries are already signed. */
export async function sourceSign(signedAuthXdr: string): Promise<string> {
  const sourceKey = sessionStorage.getItem("swk-passkey-example-source");
  if (!sourceKey) throw new Error("no fee source");
  const { Keypair } = await import("@stellar/stellar-sdk");
  const tx = TransactionBuilder.fromXDR(signedAuthXdr, NETWORK_PASSPHRASE);
  tx.sign(Keypair.fromSecret(sourceKey));
  return tx.toXDR();
}
