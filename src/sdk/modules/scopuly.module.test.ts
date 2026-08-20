/// <reference lib="deno.ns" />
import { assertEquals } from "jsr:@std/assert@1";
import { Networks } from "../../types/mod.ts";
import { ScopulyModule } from "./scopuly.module.ts";

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

type ProviderChange = {
  address: string;
  isConnected: boolean;
  network: string;
  networkPassphrase: string;
  changed: Array<"address" | "isConnected" | "network" | "networkPassphrase">;
};

type FakeProvider = ReturnType<typeof makeProvider>;

interface FakeWindow extends EventTarget {
  scopuly?: FakeProvider;
}

function makeWindow(): FakeWindow {
  const win = new EventTarget() as FakeWindow;
  g.window = win;
  return win;
}

function clearWindow(): void {
  delete g.window;
}

function makeProvider(platform: "mobile" | "extension" | "unknown" = "mobile") {
  let changeListener: ((event: ProviderChange) => void) | undefined;
  const calls = {
    requestAccess: 0,
    getAddress: 0,
    disconnect: 0,
  };

  return {
    isScopuly: true,
    platform,
    calls,
    emitChange(event: ProviderChange): void {
      changeListener?.(event);
    },
    isConnected: () => Promise.resolve({ isConnected: true }),
    requestAccess: () => {
      calls.requestAccess += 1;
      return Promise.resolve({ address: "GACCESS" });
    },
    getAddress: () => {
      calls.getAddress += 1;
      return Promise.resolve({ address: "GADDRESS" });
    },
    getPublicKey: () => Promise.resolve("GPUBLIC"),
    getNetwork: () => Promise.resolve({ network: "PUBLIC", networkPassphrase: Networks.PUBLIC }),
    signTransaction: () => Promise.resolve({ signedTxXdr: "", signedXDR: "SIGNED_XDR", signerAddress: "GSIGNER" }),
    signAndSubmitTransaction: () => Promise.resolve({ status: "success" as const, hash: "TX_HASH" }),
    signMessage: () => Promise.resolve({ signedMessage: "SIGNED_MESSAGE", signerAddress: "GSIGNER" }),
    signAuthEntry: () => Promise.resolve({ signedAuthEntry: "SIGNED_AUTH", signerAddress: "GSIGNER" }),
    disconnect: () => {
      calls.disconnect += 1;
      return Promise.resolve();
    },
    onChange(listener: (event: ProviderChange) => void): () => void {
      changeListener = listener;
      return () => {
        if (changeListener === listener) changeListener = undefined;
      };
    },
    removeListener(listener: (event: ProviderChange) => void): void {
      if (changeListener === listener) changeListener = undefined;
    },
  };
}

Deno.test("isAvailable(): returns false without a browser window", async () => {
  clearWindow();
  assertEquals(await new ScopulyModule().isAvailable(), false);
});

Deno.test("isAvailable(): waits for the Scopuly mobile provider initialization event", async () => {
  const win = makeWindow();

  try {
    const module = new ScopulyModule();
    const pending = module.isAvailable();

    win.scopuly = makeProvider();
    win.dispatchEvent(new Event("scopuly#initialized"));

    assertEquals(await pending, true);
    assertEquals(await module.isPlatformWrapper(), true);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): detects an injected Scopuly browser extension", async () => {
  const win = makeWindow();
  win.scopuly = makeProvider("extension");

  try {
    const module = new ScopulyModule();

    assertEquals(await module.isAvailable(), true);
    assertEquals(await module.isPlatformWrapper(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): waits for the Scopuly browser extension initialization event", async () => {
  const win = makeWindow();

  try {
    const module = new ScopulyModule();
    const pending = module.isAvailable();

    win.scopuly = makeProvider("extension");
    win.dispatchEvent(new Event("scopuly#initialized"));

    assertEquals(await pending, true);
    assertEquals(await module.isPlatformWrapper(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): rejects an unsupported Scopuly platform", async () => {
  const win = makeWindow();
  win.scopuly = makeProvider("unknown");

  try {
    assertEquals(await new ScopulyModule().isAvailable(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable(): returns false when the provider is not injected before the timeout", async () => {
  makeWindow();

  try {
    assertEquals(await new ScopulyModule().isAvailable(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("onChange(): subscribes when the provider is injected after module initialization", () => {
  const win = makeWindow();
  const provider = makeProvider();

  try {
    let address: string | undefined;
    const module = new ScopulyModule();

    module.onChange((event) => address = event.address);
    win.scopuly = provider;
    win.dispatchEvent(new Event("scopuly#initialized"));
    provider.emitChange({
      address: "GINITIALIZED",
      isConnected: true,
      network: "PUBLIC",
      networkPassphrase: Networks.PUBLIC,
      changed: ["address"],
    });

    assertEquals(address, "GINITIALIZED");
  } finally {
    clearWindow();
  }
});

Deno.test("getAddress(): requests access unless explicitly skipped", async () => {
  const win = makeWindow();
  const provider = makeProvider();
  win.scopuly = provider;

  try {
    const module = new ScopulyModule();

    assertEquals(await module.getAddress(), { address: "GACCESS" });
    assertEquals(await module.getAddress({ skipRequestAccess: true }), { address: "GADDRESS" });
    assertEquals(provider.calls.requestAccess, 1);
    assertEquals(provider.calls.getAddress, 1);
  } finally {
    clearWindow();
  }
});

Deno.test("provider methods: delegate supported signing, network, change, and disconnect flows", async () => {
  const win = makeWindow();
  const provider = makeProvider();
  win.scopuly = provider;

  try {
    const module = new ScopulyModule();
    let changeEvent: { address: string; network: string; networkPassphrase: string } | undefined;

    module.onChange((event) => changeEvent = event);
    provider.emitChange({
      address: "GCHANGED",
      isConnected: true,
      network: "PUBLIC",
      networkPassphrase: Networks.PUBLIC,
      changed: ["address"],
    });

    assertEquals(changeEvent, {
      address: "GCHANGED",
      network: "PUBLIC",
      networkPassphrase: Networks.PUBLIC,
    });
    assertEquals(await module.signTransaction("XDR"), {
      signedTxXdr: "SIGNED_XDR",
      signerAddress: "GSIGNER",
    });
    assertEquals(await module.signAndSubmitTransaction("XDR"), { status: "success" });
    assertEquals(await module.signAuthEntry("AUTH"), {
      signedAuthEntry: "SIGNED_AUTH",
      signerAddress: "GSIGNER",
    });
    assertEquals(await module.signMessage("MESSAGE"), {
      signedMessage: "SIGNED_MESSAGE",
      signerAddress: "GSIGNER",
    });
    assertEquals(await module.getNetwork(), { network: "PUBLIC", networkPassphrase: Networks.PUBLIC });

    await module.disconnect();
    assertEquals(provider.calls.disconnect, 1);
  } finally {
    clearWindow();
  }
});

Deno.test("signTransaction(): rejects an empty provider result", async () => {
  const win = makeWindow();
  const provider = makeProvider();
  provider.signTransaction = () => Promise.resolve({ signedTxXdr: "", signedXDR: "", signerAddress: "GSIGNER" });
  win.scopuly = provider;

  try {
    const error = await new ScopulyModule().signTransaction("XDR").then(
      () => undefined,
      (reason) => reason,
    );

    assertEquals(error, {
      code: -3,
      message: "Scopuly returned an empty signed transaction.",
      ext: undefined,
    });
  } finally {
    clearWindow();
  }
});
