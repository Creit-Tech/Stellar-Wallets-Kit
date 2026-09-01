import { expect, test } from "@playwright/test";

/**
 * What the wallet list does in a browser with no platform authenticator. Only Chromium
 * exposes a virtual authenticator over CDP, so Firefox and WebKit run headless with no
 * authenticator at all: the interesting question there is whether the module degrades
 * cleanly (renders unavailable, never throws, never stalls the kit's wallet list).
 */
test.describe("wallet list across browsers", () => {
  test("the kit renders the wallet list and includes Passkey", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();

    await expect(page.locator("li", { hasText: "Passkey" })).toHaveCount(1);
    await expect(page.getByText("Loading wallets...")).toHaveCount(0);
    expect(errors, `uncaught page errors: ${errors.join(" | ")}`).toHaveLength(0);
  });

  test("isAvailable answers well inside the kit's 1000ms budget", async ({ page }) => {
    await page.goto("/?mode=local");
    const elapsed = await page.evaluate(async () => {
      const started = performance.now();
      const pkc = (globalThis as unknown as {
        PublicKeyCredential?: { isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean> };
      }).PublicKeyCredential;
      if (pkc?.isUserVerifyingPlatformAuthenticatorAvailable) {
        await pkc.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false);
      }
      return performance.now() - started;
    });
    expect(elapsed).toBeLessThan(1000);
  });

  test("the mock-authenticator mode signs a transaction in every engine", async ({ page }) => {
    // `?mode=mock` replaces navigator.credentials with a deterministic in-process
    // authenticator, so the Soroban assembly path (challenge, low-S, entry shape) is
    // exercised on engines where no virtual authenticator exists.
    await page.goto("/?mode=mock");
    await page.getByTestId("connect").click();
    await page.locator("li", { hasText: "Passkey" }).first().click();
    await expect(page.getByTestId("address")).toHaveText(/^C[A-Z0-9]{55}$/, { timeout: 20_000 });

    await page.getByTestId("sign-tx").click();
    await expect(page.getByTestId("verdict")).toHaveText(/^PASS/, { timeout: 20_000 });
  });
});
