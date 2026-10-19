/// <reference lib="deno.ns" />
import { assertEquals, assertObjectMatch, assertRejects } from "jsr:@std/assert@1";
import { type IOnChangeEvent, ModuleType, Networks } from "../../types/mod.ts";
import { LANTERN_ID, LanternModule, parseLanternError } from "./lantern.module.ts";

/**
 * Lantern's extension injects `window.lantern`. These tests install a fake one as the global `window` and check that
 * the module forwards each call and turns Lantern's string error codes into the kit's numeric ones.
 */

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

class FakeLanternError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
  }
}

function unsupported(): Promise<never> {
  return Promise.reject(
    new FakeLanternError("unsupported", "This version of Lantern does not support that request yet"),
  );
}

function makeProvider() {
  const changeListeners = new Set<() => void>();
  const calls = {
    requestAccess: 0,
    getAddress: 0,
    signTransaction: [] as unknown[][],
  };

  return {
    isLantern: true as const,
    apiVersion: 1,
    calls,
    changeListeners,
    emitChange(): void {
      changeListeners.forEach((cb) => cb());
    },
    isConnected: () => Promise.resolve({ isConnected: true, apiVersion: 1 }),
    requestAccess: () => {
      calls.requestAccess += 1;
      return Promise.resolve({ address: "GACCESS" });
    },
    getAddress: (): Promise<{ address: string }> => {
      calls.getAddress += 1;
      return Promise.resolve({ address: "GADDRESS" });
    },
    getNetwork: () => Promise.resolve({ network: "TESTNET", networkPassphrase: Networks.TESTNET }),
    signTransaction: (...args: unknown[]): Promise<{ signedTxXdr: string; signerAddress: string }> => {
      calls.signTransaction.push(args);
      return Promise.resolve({ signedTxXdr: "SIGNED_XDR", signerAddress: "GADDRESS" });
    },
    signAuthEntry: unsupported,
    signMessage: unsupported,
    on: (_event: string, cb: () => void) => void changeListeners.add(cb),
    off: (_event: string, cb: () => void) => void changeListeners.delete(cb),
  };
}

type FakeProvider = ReturnType<typeof makeProvider>;

function withLantern(provider: FakeProvider | Record<string, unknown> = makeProvider()): FakeProvider {
  g.window = { lantern: provider };
  return provider as FakeProvider;
}

function clearWindow(): void {
  delete g.window;
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/** The error a call rejects with, typed as the kit's `{ code, message, ext }` shape. */
function rejection(fn: () => Promise<unknown>): Promise<Record<string, unknown>> {
  return assertRejects(fn) as Promise<Record<string, unknown>>;
}

Deno.test("describes itself to the kit", () => {
  const module = new LanternModule();
  assertEquals(module.moduleType, ModuleType.HOT_WALLET);
  assertEquals(module.productId, LANTERN_ID);
  assertEquals(module.productName, "Lantern");
  assertEquals(module.productUrl, "https://golantern.xyz");
  assertEquals(module.productIcon, "https://golantern.xyz/wallet-icon.png");
});

Deno.test("isAvailable(): false without a browser window, without Lantern, or when Lantern does not answer", async () => {
  try {
    clearWindow();
    assertEquals(await new LanternModule().isAvailable(), false);

    g.window = {};
    assertEquals(await new LanternModule().isAvailable(), false);

    withLantern({ isLantern: false, isConnected: () => Promise.resolve({ isConnected: true }) });
    assertEquals(await new LanternModule().isAvailable(), false);

    const provider = withLantern();
    provider.isConnected = () => Promise.reject(new Error("gone"));
    assertEquals(await new LanternModule().isAvailable(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): true when window.lantern is Lantern and answers", async () => {
  withLantern();
  try {
    assertEquals(await new LanternModule().isAvailable(), true);
  } finally {
    clearWindow();
  }
});

Deno.test("getAddress(): asks to connect, or only reads with skipRequestAccess", async () => {
  const provider = withLantern();
  try {
    const module = new LanternModule();
    assertEquals(await module.getAddress(), { address: "GACCESS" });
    assertEquals(provider.calls.requestAccess, 1);
    assertEquals(provider.calls.getAddress, 0);

    assertEquals(await module.getAddress({ skipRequestAccess: true }), { address: "GADDRESS" });
    assertEquals(provider.calls.requestAccess, 1);
    assertEquals(provider.calls.getAddress, 1);
  } finally {
    clearWindow();
  }
});

Deno.test("signTransaction(): passes the network and account through and returns the kit shape", async () => {
  const provider = withLantern();
  try {
    const module = new LanternModule();
    assertEquals(
      await module.signTransaction("XDR", { networkPassphrase: Networks.TESTNET, address: "GADDRESS", path: "x" }),
      { signedTxXdr: "SIGNED_XDR", signerAddress: "GADDRESS" },
    );
    assertEquals(provider.calls.signTransaction[0], ["XDR", {
      networkPassphrase: Networks.TESTNET,
      address: "GADDRESS",
    }]);

    await module.signTransaction("XDR");
    assertEquals(provider.calls.signTransaction[1], ["XDR", {}]);
  } finally {
    clearWindow();
  }
});

Deno.test("signTransaction(): refuses submit because Lantern signs only", async () => {
  const provider = withLantern();
  try {
    const error = await rejection(() => new LanternModule().signTransaction("XDR", { submit: true }));
    assertEquals(error.code, -1);
    assertEquals(error.ext, "unsupported");
    assertEquals(provider.calls.signTransaction.length, 0);
  } finally {
    clearWindow();
  }
});

Deno.test("signTransaction(): a rejection becomes -4 with Lantern's code in ext", async () => {
  const provider = withLantern();
  provider.signTransaction = () => Promise.reject(new FakeLanternError("user_rejected", "User rejected the request"));
  try {
    const error = await rejection(() => new LanternModule().signTransaction("XDR"));
    assertEquals(error, { code: -4, message: "User rejected the request", ext: "user_rejected" });
  } finally {
    clearWindow();
  }
});

Deno.test("parseLanternError(): not_allowed and account_mismatch become -3, the rest -1", () => {
  assertEquals(parseLanternError(new FakeLanternError("not_allowed", "x")).code, -3);
  assertEquals(parseLanternError(new FakeLanternError("account_mismatch", "x")).code, -3);
  assertEquals(parseLanternError(new FakeLanternError("network_mismatch", "Wrong network")), {
    code: -1,
    message: "Wrong network",
    ext: "network_mismatch",
  });
  assertEquals(parseLanternError(new FakeLanternError("timeout", "")), {
    code: -1,
    message: "Unhandled error from Lantern",
    ext: "timeout",
  });
  assertEquals(parseLanternError(undefined).code, -1);
});

Deno.test("signAuthEntry() and signMessage(): reject as unsupported", async () => {
  withLantern();
  try {
    const module = new LanternModule();
    const authError = await rejection(() => module.signAuthEntry("ENTRY"));
    assertEquals(authError.code, -1);
    assertEquals(authError.ext, "unsupported");

    const messageError = await rejection(() => module.signMessage("MESSAGE"));
    assertEquals(messageError.code, -1);
    assertEquals(messageError.ext, "unsupported");
  } finally {
    clearWindow();
  }
});

Deno.test("getNetwork(): returns Lantern's network", async () => {
  withLantern();
  try {
    assertEquals(await new LanternModule().getNetwork(), { network: "TESTNET", networkPassphrase: Networks.TESTNET });
  } finally {
    clearWindow();
  }
});

Deno.test("every call fails with the kit's error shape when Lantern is not installed", async () => {
  g.window = {};
  try {
    const module = new LanternModule();
    assertObjectMatch(await rejection(() => module.getAddress()), {
      code: -1,
      message: "Lantern is not installed",
    });
    assertObjectMatch(await rejection(() => module.getNetwork()), {
      code: -1,
      message: "Lantern is not installed",
    });
  } finally {
    clearWindow();
  }
});

Deno.test("onChange(): reports the new account and network, or the error after a disconnect", async () => {
  const provider = withLantern();
  try {
    const events: IOnChangeEvent[] = [];
    new LanternModule().onChange((event) => events.push(event));

    provider.emitChange();
    await tick();

    provider.getAddress = () =>
      Promise.reject(new FakeLanternError("not_allowed", "This site is not connected to Lantern"));
    provider.emitChange();
    await tick();

    assertEquals(events, [
      { address: "GADDRESS", network: "TESTNET", networkPassphrase: Networks.TESTNET },
      {
        address: "",
        network: "",
        networkPassphrase: "",
        error: { code: -3, message: "This site is not connected to Lantern", ext: "not_allowed" },
      },
    ]);
  } finally {
    clearWindow();
  }
});

Deno.test("onChange(): a second call replaces the first listener", async () => {
  const provider = withLantern();
  try {
    const module = new LanternModule();
    let first = 0;
    let second = 0;
    module.onChange(() => first++);
    module.onChange(() => second++);
    assertEquals(provider.changeListeners.size, 1);

    provider.emitChange();
    await tick();
    assertEquals(first, 0);
    assertEquals(second, 1);
  } finally {
    clearWindow();
  }
});
