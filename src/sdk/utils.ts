import type { IKitError } from "../types/mod.ts";
import { activeModule, resetWalletState } from "../state/values.ts";
import { closeEvent, disconnectEvent } from "../state/events.ts";

export function parseError(e: any): IKitError {
  return {
    code: e?.error?.code || e?.code || -1,
    message: e?.error?.message || e?.message || (typeof e === "string" && e) || "Unhandled error from the wallet",
    ext: e?.error?.ext || e?.ext,
  };
}

export function disconnect() {
  if (activeModule.value?.disconnect) {
    activeModule.value.disconnect();
  }

  resetWalletState();
  disconnectEvent.next();
  closeEvent.next();
}
