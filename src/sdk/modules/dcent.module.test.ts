/// <reference lib="deno.ns" />
import { assertEquals } from "jsr:@std/assert@1";
import { DcentModule } from "./dcent.module.ts";

/**
 * Bug essence (injection race):
 *   SWK's `refreshSupportedWallets()` evaluates `DcentModule.isAvailable()` within a
 *   1000ms race (see ModuleInterface.isAvailable doc). D'CENT's provider engine is
 *   injected asynchronously — the mobile in-app browser fetches it remotely and injects
 *   on a post-load fallback when the engine is not cached — so on a cold load the
 *   detection sentinel (`window.stellar` / `window.dcentStellarProvider`) may not exist
 *   yet when the kit first evaluates the wallet list. The buggy implementation returns
 *   `false` immediately and the kit caches D'CENT as unavailable until the next modal.
 *   The fix waits for the `dcent#initialized` event the provider dispatches on injection,
 *   staying within the kit's 1000ms budget.
 */

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

interface FakeWin extends EventTarget {
  stellar?: { provider: string; platform: string; version: string };
  dcentStellarProvider?: { isConnected: () => Promise<{ isConnected: boolean }> };
}

/** Install a bare `window` (EventTarget-backed) without the sentinel injected yet. */
function makeWindow(): FakeWin {
  const win = new EventTarget() as FakeWin;
  g.window = win;
  return win;
}

function clearWindow(): void {
  delete g.window;
}

const SENTINEL = { provider: "dcent", platform: "mobile", version: "1.0.0" } as const;
const connectedProvider = { isConnected: () => Promise.resolve({ isConnected: true }) };

Deno.test("isAvailable(): returns true after dcent#initialized even when called before the sentinel is injected (waits out the injection race)", async () => {
  const win = makeWindow(); // window exists, but stellar/provider not injected yet (cold load race)
  try {
    const pending = new DcentModule().isAvailable(); // the dcent#initialized listener must be attached at this point

    // simulate the asynchronous engine injection
    win.stellar = { ...SENTINEL };
    win.dcentStellarProvider = connectedProvider;
    win.dispatchEvent(new Event("dcent#initialized"));

    assertEquals(await pending, true);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): returns false when the sentinel is never injected (no spurious true after the wait)", async () => {
  makeWindow(); // stellar/provider never injected → false after timeout
  try {
    assertEquals(await new DcentModule().isAvailable(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): returns true immediately when the sentinel is already injected (warm-path regression guard)", async () => {
  const win = makeWindow();
  win.stellar = { ...SENTINEL };
  win.dcentStellarProvider = connectedProvider;
  try {
    assertEquals(await new DcentModule().isAvailable(), true);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): returns false when provider.isConnected() is false (gate passthrough guard)", async () => {
  const win = makeWindow();
  win.stellar = { ...SENTINEL };
  win.dcentStellarProvider = { isConnected: () => Promise.resolve({ isConnected: false }) };
  try {
    assertEquals(await new DcentModule().isAvailable(), false);
  } finally {
    clearWindow();
  }
});
