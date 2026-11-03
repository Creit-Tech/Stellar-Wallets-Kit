/**
 * WebAuthn ceremonies and credential parsing for the passkey module.
 *
 * Turns what the browser's credential API returns into what a Soroban smart
 * wallet needs: the 65-byte P-256 public key at registration, and the
 * authenticator data + client data + compact signature at assertion time.
 */

import { derToCompactSignature, isOnCurve } from "./p256.ts";

export interface PasskeyCredential {
  credentialId: Uint8Array;
  /** 65-byte uncompressed P-256 point: the smart wallet's signer key. */
  publicKey: Uint8Array;
  /** Whether the authenticator stored a discoverable credential, when reported. */
  residentKey?: boolean;
}

export interface PasskeyAssertion {
  credentialId: Uint8Array;
  authenticatorData: Uint8Array;
  clientDataJson: Uint8Array;
  /** 64-byte low-s signature, ready for on-chain secp256r1 verification. */
  signature: Uint8Array;
}

/** True when this context can run passkey ceremonies at all. */
export function isWebAuthnAvailable(): boolean {
  return typeof PublicKeyCredential !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof isSecureContext !== "undefined" && isSecureContext;
}

/**
 * Register a new passkey and extract its public key. ES256 only, because that is
 * the algorithm Soroban verifies natively; attestation is "none" because the
 * wallet trusts the key, not the device's paperwork.
 */
export async function createPasskey(options: {
  rpName: string;
  rpId?: string;
  userName: string;
}): Promise<PasskeyCredential> {
  const credential = await navigator.credentials.create({
    publicKey: {
      rp: options.rpId ? { id: options.rpId, name: options.rpName } : { name: options.rpName },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: options.userName,
        displayName: options.userName,
      },
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
      attestation: "none",
      extensions: { credProps: true },
      timeout: 60_000,
    },
  }) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey creation was cancelled");

  const response = credential.response as AuthenticatorAttestationResponse;
  const result: PasskeyCredential = {
    credentialId: new Uint8Array(credential.rawId),
    publicKey: extractPublicKey(response),
  };

  const credProps = credential.getClientExtensionResults?.().credProps;
  if (credProps && typeof credProps.rk === "boolean") result.residentKey = credProps.rk;

  return result;
}

/**
 * Sign a 32-byte payload with a passkey. When no credential id is given the
 * browser offers the user their discoverable credentials, which is also how an
 * existing wallet is connected.
 */
export async function getAssertion(options: {
  challenge: Uint8Array;
  rpId?: string;
  allowCredentials?: Uint8Array[];
}): Promise<PasskeyAssertion> {
  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: copyBytes(options.challenge),
    userVerification: "preferred",
    timeout: 60_000,
  };
  if (options.rpId) publicKey.rpId = options.rpId;
  if (options.allowCredentials?.length) {
    publicKey.allowCredentials = options.allowCredentials.map((id) => ({
      type: "public-key",
      id: copyBytes(id),
    }));
  }

  const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey assertion was cancelled");

  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    credentialId: new Uint8Array(credential.rawId),
    authenticatorData: new Uint8Array(response.authenticatorData),
    clientDataJson: new Uint8Array(response.clientDataJSON),
    signature: derToCompactSignature(new Uint8Array(response.signature)),
  };
}

/**
 * Pull the 65-byte P-256 public key out of an attestation. Browsers expose it as
 * a DER SubjectPublicKeyInfo via getPublicKey(); when that is unavailable the key
 * is read from the COSE structure inside the authenticator data instead.
 */
function extractPublicKey(response: AuthenticatorAttestationResponse): Uint8Array {
  const spki = response.getPublicKey?.();
  if (spki) {
    const bytes = new Uint8Array(spki);
    // Fixed 26-byte SPKI header for an EC P-256 key, then the raw point.
    if (bytes.length !== 91) throw new Error(`unexpected SPKI length ${bytes.length}`);
    return validatePoint(bytes.subarray(26));
  }

  if (typeof response.getAuthenticatorData === "function") {
    return publicKeyFromAuthenticatorData(new Uint8Array(response.getAuthenticatorData()));
  }

  throw new Error("credential exposed no public key");
}

function validatePoint(point: Uint8Array): Uint8Array {
  if (!isOnCurve(point)) throw new Error("public key is not a valid P-256 point");
  return Uint8Array.from(point);
}

/**
 * Authenticator data layout: rpIdHash(32) | flags(1) | signCount(4) |
 * aaguid(16) | credentialIdLength(2, big-endian) | credentialId | COSE key.
 */
function publicKeyFromAuthenticatorData(data: Uint8Array): Uint8Array {
  const ATTESTED_DATA_FLAG = 0x40;
  if (((data[32] ?? 0) & ATTESTED_DATA_FLAG) === 0) {
    throw new Error("authenticator data has no attested credential data");
  }
  const credentialIdLength = ((data[53] ?? 0) << 8) | (data[54] ?? 0);
  const cose = data.subarray(55 + credentialIdLength);
  const { x, y } = decodeCoseP256Key(cose);

  const point = new Uint8Array(65);
  point[0] = 0x04;
  point.set(x, 1);
  point.set(y, 33);
  return validatePoint(point);
}

/**
 * Minimal CBOR reader scoped to COSE_Key maps: integer labels mapping to
 * integers and byte strings. Only labels -2 (x) and -3 (y) are needed.
 */
function decodeCoseP256Key(cose: Uint8Array): { x: Uint8Array; y: Uint8Array } {
  let pos = 0;

  const readLength = (info: number): number => {
    if (info < 24) return info;
    if (info === 24) return cose[pos++] ?? raise("unexpected end of COSE key");
    if (info === 25) {
      const value = ((cose[pos] ?? 0) << 8) | (cose[pos + 1] ?? 0);
      pos += 2;
      return value;
    }
    return raise("unsupported CBOR length encoding");
  };

  const readItem = (): number | Uint8Array => {
    const head = cose[pos++] ?? raise("unexpected end of COSE key");
    const majorType = head >> 5;
    const info = head & 0x1f;
    switch (majorType) {
      case 0:
        return readLength(info);
      case 1:
        return -1 - readLength(info);
      case 2:
      case 3: {
        const length = readLength(info);
        const slice = cose.subarray(pos, pos + length);
        pos += length;
        return slice;
      }
      default:
        return raise(`unsupported CBOR major type ${majorType}`);
    }
  };

  const mapHead = cose[pos++] ?? raise("empty COSE key");
  if (mapHead >> 5 !== 5) raise("COSE key is not a CBOR map");

  let x: Uint8Array | undefined;
  let y: Uint8Array | undefined;
  for (let i = 0; i < (mapHead & 0x1f); i++) {
    const label = readItem();
    const value = readItem();
    if (label === -2 && value instanceof Uint8Array) x = value;
    else if (label === -3 && value instanceof Uint8Array) y = value;
  }

  if (!x || !y || x.length !== 32 || y.length !== 32) raise("COSE key is missing P-256 coordinates");
  return { x: x!, y: y! };
}

function raise(message: string): never {
  throw new Error(message);
}

// The DOM types want ArrayBuffer-backed views; copying also detaches the request
// from any buffer the caller may reuse.
function copyBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy;
}
