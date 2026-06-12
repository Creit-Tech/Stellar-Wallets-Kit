/**
 * The Soroban side of the passkey module: building the payload a passkey signs,
 * deriving the smart wallet's address, and encoding the WebAuthn assertion into
 * the signature value the wallet contract verifies in __check_auth.
 *
 * The default signature layout targets the smart-wallet contracts from the
 * passkey-kit lineage (kalepail/passkey-kit), which are the de-facto standard
 * for passkey wallets on Stellar today. Wallets built on a different contract
 * supply their own encoder through the module params.
 */

import { Address, hash, StrKey, xdr } from "@stellar/stellar-base";
import type { PasskeyAssertion } from "./webauthn.ts";

// stellar-base accepts plain Uint8Arrays at runtime, but its type declarations
// ask for Buffer. The cast below satisfies them without importing Buffer types
// or requiring a polyfill in browsers, which do not have one. The input type is
// derived from hash() itself so this keeps tracking the library's signatures.
type StellarBytes = Parameters<typeof hash>[0];
const asBytes = (bytes: Uint8Array): StellarBytes => bytes as unknown as StellarBytes;

/** Encodes an assertion into the ScVal the wallet contract's __check_auth expects. */
export type SignatureEncoder = (assertion: PasskeyAssertion) => xdr.ScVal;

/**
 * The 32-byte payload the contract verifies: the hash of the Soroban
 * authorization preimage. The passkey signs exactly this as its WebAuthn
 * challenge, and the contract re-derives it on-chain, so the construction has to
 * match the protocol byte for byte.
 *
 * The entry must already carry its nonce and signature expiration ledger —
 * setting those is the transaction builder's job, not the signer's.
 */
export function authorizationPayload(
  entry: xdr.SorobanAuthorizationEntry,
  networkPassphrase: string,
): Uint8Array {
  const credentials = entry.credentials();
  if (credentials.switch() !== xdr.SorobanCredentialsType.sorobanCredentialsAddress()) {
    throw new Error("authorization entry does not use address credentials");
  }

  const address = credentials.address();
  const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
    new xdr.HashIdPreimageSorobanAuthorization({
      networkId: hash(asBytes(new TextEncoder().encode(networkPassphrase))),
      nonce: address.nonce(),
      signatureExpirationLedger: address.signatureExpirationLedger(),
      invocation: entry.rootInvocation(),
    }),
  );
  return new Uint8Array(hash(preimage.toXDR()));
}

/**
 * The wallet's contract address, derived deterministically from the deployer and
 * the credential id (the salt convention of the passkey-kit factory). Known
 * before the wallet is even deployed, which is what lets getAddress answer
 * without touching the network.
 */
export function deriveWalletAddress(options: {
  deployer: string;
  credentialId: Uint8Array;
  networkPassphrase: string;
}): string {
  const preimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId: hash(asBytes(new TextEncoder().encode(options.networkPassphrase))),
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
        new xdr.ContractIdPreimageFromAddress({
          address: new Address(options.deployer).toScAddress(),
          salt: hash(asBytes(options.credentialId)),
        }),
      ),
    }),
  );
  return StrKey.encodeContract(hash(preimage.toXDR()));
}

/**
 * The passkey-kit smart-wallet signature layout:
 *
 *   Signatures: Map<SignerKey, Signature>
 *     SignerKey::Secp256r1(Bytes)            — the credential id
 *     Signature::Secp256r1(Secp256r1Signature)
 *       Secp256r1Signature { authenticator_data, client_data_json, signature }
 *
 * Soroban encodes enum variants as Vec[Symbol, value] and structs as Maps with
 * symbol keys in lexicographic order.
 */
export function passkeyKitSignatureEncoder(assertion: PasskeyAssertion): xdr.ScVal {
  const signerKey = xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol("Secp256r1"),
    bytesScVal(assertion.credentialId),
  ]);

  const signatureStruct = xdr.ScVal.scvMap([
    mapEntry("authenticator_data", bytesScVal(assertion.authenticatorData)),
    mapEntry("client_data_json", bytesScVal(assertion.clientDataJson)),
    mapEntry("signature", bytesScVal(assertion.signature)),
  ]);
  const signature = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol("Secp256r1"), signatureStruct]);

  return xdr.ScVal.scvMap([new xdr.ScMapEntry({ key: signerKey, val: signature })]);
}

/** Apply an encoded signature to the entry's address credentials, in place. */
export function attachSignature(entry: xdr.SorobanAuthorizationEntry, signature: xdr.ScVal): void {
  entry.credentials().address().signature(signature);
}

/**
 * Walk a transaction envelope and return the auth entries that this wallet must
 * sign: address-credential entries whose address is the wallet's contract.
 * Works on the raw XDR tree so mutations made through the returned references
 * serialize back into the envelope.
 */
export function entriesRequiringWalletSignature(
  envelope: xdr.TransactionEnvelope,
  walletAddress: string,
): xdr.SorobanAuthorizationEntry[] {
  if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTxFeeBump()) {
    throw new Error("fee-bump transactions are not supported; sign the inner transaction first");
  }
  const operations = envelope.switch() === xdr.EnvelopeType.envelopeTypeTx()
    ? envelope.v1().tx().operations()
    : envelope.v0().tx().operations();

  const matching: xdr.SorobanAuthorizationEntry[] = [];
  for (const operation of operations) {
    if (operation.body().switch() !== xdr.OperationType.invokeHostFunction()) continue;
    for (const entry of operation.body().invokeHostFunctionOp().auth()) {
      if (entry.credentials().switch() !== xdr.SorobanCredentialsType.sorobanCredentialsAddress()) continue;
      const entryAddress = Address.fromScAddress(entry.credentials().address().address()).toString();
      if (entryAddress === walletAddress) matching.push(entry);
    }
  }
  return matching;
}

// stellar-base accepts plain Uint8Arrays throughout its XDR layer, so no Buffer
// global is needed — important because browsers do not have one.
function bytesScVal(bytes: Uint8Array): xdr.ScVal {
  return xdr.ScVal.scvBytes(asBytes(bytes));
}

function mapEntry(symbol: string, val: xdr.ScVal): xdr.ScMapEntry {
  return new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol(symbol), val });
}
