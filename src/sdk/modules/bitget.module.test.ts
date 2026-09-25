/// <reference lib="deno.ns" />
import { assertEquals, assertNotStrictEquals } from "jsr:@std/assert@1";
import { BitgetModule } from "./bitget.module.ts";

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

function clearWindow(): void {
  delete g.window;
}

Deno.test("constructor does not throw when window is undefined (SSR/Node.js)", () => {
  clearWindow();
  try {
    const mod = new BitgetModule();
    assertNotStrictEquals(mod, undefined);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable() returns false when window is undefined", async () => {
  clearWindow();
  try {
    const mod = new BitgetModule();
    assertEquals(await mod.isAvailable(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable() returns false when window exists but bitkeep is not injected", async () => {
  g.window = {};
  try {
    const mod = new BitgetModule();
    assertEquals(await mod.isAvailable(), false);
  } finally {
    clearWindow();
  }
});

Deno.test("isAvailable() returns true when bitkeep.stellar is injected", async () => {
  g.window = { bitkeep: { stellar: { connect: () => Promise.resolve("GA...") } } };
  try {
    const mod = new BitgetModule();
    assertEquals(await mod.isAvailable(), true);
  } finally {
    clearWindow();
  }
});
