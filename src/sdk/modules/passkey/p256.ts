/**
 * P-256 (secp256r1) helpers for WebAuthn signatures.
 *
 * Implemented with plain BigInt arithmetic instead of a crypto dependency on purpose:
 * every input here is public data (public keys and signatures produced by the
 * authenticator), so there are no secrets to protect and no constant-time requirements.
 * The operations are small and fully covered by cross-checks against independent
 * implementations in the proposing repo's test suite.
 */

// Field prime, group order, and curve constant b for P-256 (FIPS 186-4).
const P = BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff");
const N = BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551");
const B = BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b");
const HALF_N = N >> 1n;

/**
 * Convert a DER-encoded ECDSA signature (what authenticators return) into the
 * 64-byte r||s form Soroban contracts verify, normalizing s to the low half of
 * the curve order. Stellar rejects high-s ("malleable") signatures, so skipping
 * the normalization produces signatures that fail on-chain.
 */
export function derToCompactSignature(der: Uint8Array): Uint8Array {
  // DER layout: 0x30 totalLen 0x02 rLen rBytes 0x02 sLen sBytes.
  // A P-256 signature is at most 72 bytes, so lengths always use the short form.
  if (der[0] !== 0x30) throw new Error("signature is not a DER sequence");
  if ((der[1] ?? 0) + 2 !== der.length) throw new Error("DER sequence length mismatch");

  const [r, afterR] = readDerInteger(der, 2);
  const [s, end] = readDerInteger(der, afterR);
  if (end !== der.length) throw new Error("trailing bytes after DER signature");

  if (r <= 0n || r >= N || s <= 0n || s >= N) throw new Error("signature scalar out of range");

  const lowS = s > HALF_N ? N - s : s;

  const out = new Uint8Array(64);
  writeBigInt(out, r, 0);
  writeBigInt(out, lowS, 32);
  return out;
}

/** True when the 65-byte uncompressed point (0x04 || x || y) satisfies y² = x³ − 3x + b (mod p). */
export function isOnCurve(point: Uint8Array): boolean {
  if (point.length !== 65 || point[0] !== 0x04) return false;
  const x = bytesToBigInt(point.subarray(1, 33));
  const y = bytesToBigInt(point.subarray(33, 65));
  if (x >= P || y >= P) return false;

  const left = (y * y) % P;
  const right = (((x * x) % P) * x + P * 3n - 3n * x + B) % P;
  return left === right;
}

function readDerInteger(der: Uint8Array, offset: number): [bigint, number] {
  if (der[offset] !== 0x02) throw new Error("expected DER integer");
  const length = der[offset + 1] ?? 0;
  if (length === 0 || length > 33) throw new Error("DER integer length out of range");
  const start = offset + 2;
  const end = start + length;
  if (end > der.length) throw new Error("DER integer runs past the buffer");
  return [bytesToBigInt(der.subarray(start, end)), end];
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  return value;
}

function writeBigInt(target: Uint8Array, value: bigint, offset: number): void {
  for (let i = 31; i >= 0; i--) {
    target[offset + i] = Number(value & 0xffn);
    value >>= 8n;
  }
}
