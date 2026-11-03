/// <reference lib="deno.ns" />
import { assertEquals, assertExists } from "jsr:@std/assert@1";
import { type IOnChangeEvent, type ModuleInterface, ModuleType, Networks } from "../types/mod.ts";
import { activeAddress, activeModules, selectedModuleId, selectedNetwork } from "./values.ts";
import "./effects.ts";

const ADDRESS_A = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";
const ADDRESS_B = "GB7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";

/**
 * A module that only implements what the effect needs, and keeps the callback the kit
 * registers so the test can trigger a wallet-side account change.
 */
function createModule(productId: string): ModuleInterface & { emit(event: IOnChangeEvent): void } {
  let callback: ((event: IOnChangeEvent) => void) | undefined;

  return {
    moduleType: ModuleType.HOT_WALLET,
    productId,
    productName: productId,
    productUrl: "https://example.org",
    productIcon: "",
    isAvailable: (): Promise<boolean> => Promise.resolve(true),
    onChange: (cb: (event: IOnChangeEvent) => void): void => {
      callback = cb;
    },
    getAddress: (): Promise<{ address: string }> => Promise.resolve({ address: ADDRESS_A }),
    signTransaction: (): Promise<{ signedTxXdr: string }> => Promise.resolve({ signedTxXdr: "" }),
    signAuthEntry: (): Promise<{ signedAuthEntry: string }> => Promise.resolve({ signedAuthEntry: "" }),
    signMessage: (): Promise<{ signedMessage: string }> => Promise.resolve({ signedMessage: "" }),
    getNetwork: (): Promise<{ network: string; networkPassphrase: string }> =>
      Promise.resolve({ network: "public", networkPassphrase: Networks.PUBLIC }),
    emit: (event: IOnChangeEvent): void => {
      assertExists(callback, "the kit never subscribed to onChange");
      callback(event);
    },
  };
}

function selectModule(module: ModuleInterface): void {
  activeModules.value = [module];
  selectedModuleId.value = module.productId;
}

function changeEvent(address: string, networkPassphrase: string = Networks.PUBLIC): IOnChangeEvent {
  return { address, network: "public", networkPassphrase };
}

Deno.test("onChange(): updates the active address when the wallet switches account", (): void => {
  const module = createModule("wallet-a");
  selectModule(module);
  activeAddress.value = ADDRESS_A;

  module.emit(changeEvent(ADDRESS_B));

  assertEquals(activeAddress.value, ADDRESS_B);
});

Deno.test("onChange(): never changes the selected network, which SEP-43 does not cover", (): void => {
  const module = createModule("wallet-network");
  selectModule(module);
  activeAddress.value = ADDRESS_A;
  selectedNetwork.value = Networks.PUBLIC;

  module.emit(changeEvent(ADDRESS_B, Networks.TESTNET));

  assertEquals(activeAddress.value, ADDRESS_B);
  assertEquals(selectedNetwork.value, Networks.PUBLIC);
});

Deno.test("onChange(): does not connect on the wallet's behalf", (): void => {
  const module = createModule("wallet-disconnected");
  selectModule(module);
  activeAddress.value = undefined;

  module.emit(changeEvent(ADDRESS_B));

  assertEquals(activeAddress.value, undefined);
});

Deno.test("onChange(): ignores an event carrying an error", (): void => {
  const module = createModule("wallet-error");
  selectModule(module);
  activeAddress.value = ADDRESS_A;

  module.emit({ address: "", network: "", networkPassphrase: "", error: { code: -1, message: "nope" } });

  assertEquals(activeAddress.value, ADDRESS_A);
});

Deno.test("onChange(): ignores the events of a module that is no longer selected", (): void => {
  const first = createModule("wallet-first");
  selectModule(first);
  activeAddress.value = ADDRESS_A;

  const second = createModule("wallet-second");
  selectModule(second);

  first.emit(changeEvent(ADDRESS_B));

  assertEquals(activeAddress.value, ADDRESS_A);
});
