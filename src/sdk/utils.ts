import type { IKitError } from "../types/mod.ts";

export function parseError(e: any): IKitError {
  return {
    code: e?.error?.code || e?.code || -1,
    message: e?.error?.message || e?.message || (typeof e === "string" && e) || "Unhandled error from the wallet",
    ext: e?.error?.ext || e?.ext,
  };
}
