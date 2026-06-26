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

Deno.test("isAvailable(): sentinel 미주입 시점에 호출돼도 dcent#initialized 후 true 반환 (주입 레이스 대기)", async () => {
  const win = makeWindow(); // window는 있지만 stellar/provider는 아직 미주입 (cold load race)
  try {
    const pending = new DcentModule().isAvailable(); // 이 시점에 dcent#initialized 리스너가 부착돼야 함

    // engine 비동기 주입 시뮬레이션
    win.stellar = { ...SENTINEL };
    win.dcentStellarProvider = connectedProvider;
    win.dispatchEvent(new Event("dcent#initialized"));

    assertEquals(await pending, true);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): sentinel이 끝내 미주입이면 false 반환 (대기 후 spurious true 금지)", async () => {
  makeWindow(); // stellar/provider 영원히 미주입 → 타임아웃 후 false
  try {
    assertEquals(await new DcentModule().isAvailable(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): sentinel이 이미 주입돼 있으면 즉시 true (warm 경로 회귀 가드)", async () => {
  const win = makeWindow();
  win.stellar = { ...SENTINEL };
  win.dcentStellarProvider = connectedProvider;
  try {
    assertEquals(await new DcentModule().isAvailable(), true);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): provider.isConnected()가 false면 false (gate passthrough 가드)", async () => {
  const win = makeWindow();
  win.stellar = { ...SENTINEL };
  win.dcentStellarProvider = { isConnected: () => Promise.resolve({ isConnected: false }) };
  try {
    assertEquals(await new DcentModule().isAvailable(), false);
  } finally {
    clearWindow();
  }
});
