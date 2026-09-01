import { type CDPSession, expect, type Page, test } from "@playwright/test";

/**
 * Drives the passkey wallet through the kit's real auth modal in Chromium. WebAuthn is
 * backed by a CDP virtual authenticator, which is a real CTAP2 platform authenticator
 * from the browser's point of view: the page calls `navigator.credentials` exactly as
 * it would in front of a Touch ID sheet.
 */
async function addVirtualAuthenticator(page: Page): Promise<CDPSession> {
  const client = await page.context().newCDPSession(page);
  await client.send("WebAuthn.enable");
  await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  return client;
}

/** The kit renders its modal into a container appended to document.body. */
function modal(page: Page) {
  return page.locator("li", { hasText: "Passkey" }).first();
}

test.describe("PasskeyModule inside the real Stellar Wallets Kit modal", () => {
  // `?mode=local`: in-memory accounts with the browser's real navigator.credentials, which
  // the virtual authenticator backs. The page defaults to testnet for people.
  test.beforeEach(async ({ page }) => {
    await addVirtualAuthenticator(page);
    await page.addInitScript(() => globalThis.localStorage.clear());
  });

  test("the kit's wallet picker lists Passkey next to Freighter and Lobstr", async ({ page }) => {
    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();

    const items = page.locator("li");
    await expect(items.filter({ hasText: "Freighter" })).toHaveCount(1);
    await expect(items.filter({ hasText: "LOBSTR" })).toHaveCount(1);
    await expect(items.filter({ hasText: "Passkey" })).toHaveCount(1);

    await page.screenshot({ path: "test-results/01-kit-modal-wallet-list.png", fullPage: true });
  });

  test("Passkey is offered as available, and the install label is only on the others", async ({ page }) => {
    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();

    const passkeyRow = modal(page);
    await expect(passkeyRow).toBeVisible();
    // An unavailable wallet gets the kit's "Install" affordance; an available one does not.
    await expect(passkeyRow.getByText("Install")).toHaveCount(0);
    await expect(page.locator("li", { hasText: "Freighter" }).first().getByText("Install")).toHaveCount(1);
  });

  test("connecting through the modal creates the account and returns a C-address", async ({ page }) => {
    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();
    await modal(page).click();

    await expect(page.getByTestId("address")).toHaveText(/^C[A-Z0-9]{55}$/, { timeout: 20_000 });
    await expect(page.getByTestId("wallet")).toHaveText("passkey");
    await expect(page.getByTestId("network")).toContainText("Test SDF Network");
    // The modal closes itself once the kit resolves the address.
    await expect(page.locator("li", { hasText: "Passkey" })).toHaveCount(0);

    await page.screenshot({ path: "test-results/02-connected.png", fullPage: true });
  });

  test("signing a transaction through the kit produces a signature __check_auth accepts", async ({ page }) => {
    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();
    await modal(page).click();
    await expect(page.getByTestId("address")).toHaveText(/^C[A-Z0-9]{55}$/, { timeout: 20_000 });

    await page.getByTestId("sign-tx").click();
    await expect(page.getByTestId("verdict")).toHaveText(/^PASS/, { timeout: 20_000 });
    await expect(page.getByTestId("error")).toHaveText("-");
    await expect(page.getByTestId("log")).toContainText("__check_auth: PASS");

    await page.screenshot({ path: "test-results/03-signed-transaction.png", fullPage: true });
  });

  test("signing an auth entry through the kit also verifies", async ({ page }) => {
    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();
    await modal(page).click();
    await expect(page.getByTestId("address")).toHaveText(/^C[A-Z0-9]{55}$/, { timeout: 20_000 });

    await page.getByTestId("sign-auth-entry").click();
    await expect(page.getByTestId("result-sign-auth-entry")).toHaveText(/^PASS/, { timeout: 20_000 });
  });

  test("signMessage returns a signature through the kit", async ({ page }) => {
    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();
    await modal(page).click();
    await expect(page.getByTestId("address")).toHaveText(/^C[A-Z0-9]{55}$/, { timeout: 20_000 });

    await page.getByTestId("sign-message").click();
    await expect(page.getByTestId("log")).toContainText("signed message:", { timeout: 20_000 });
    await expect(page.getByTestId("error")).toHaveText("-");
  });

  test("the kit's profile modal renders the connected passkey account", async ({ page }) => {
    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();
    await modal(page).click();
    await expect(page.getByTestId("address")).toHaveText(/^C[A-Z0-9]{55}$/, { timeout: 20_000 });
    const address = await page.getByTestId("address").textContent();

    await page.getByTestId("profile").click();
    await expect(page.getByText(`${address!.slice(0, 4)}`, { exact: false }).first()).toBeVisible();
    await page.screenshot({ path: "test-results/04-profile-modal.png", fullPage: true });
  });

  test("disconnect clears the session and a reconnect returns the same account", async ({ page }) => {
    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();
    await modal(page).click();
    await expect(page.getByTestId("address")).toHaveText(/^C[A-Z0-9]{55}$/, { timeout: 20_000 });
    const first = await page.getByTestId("address").textContent();

    await page.getByTestId("disconnect").click();
    await expect(page.getByTestId("address")).toHaveText("-");

    await page.getByTestId("connect").click();
    await modal(page).click();
    await expect(page.getByTestId("address")).toHaveText(first!, { timeout: 20_000 });
  });

  test("dismissing the OS passkey sheet surfaces the kit's user-cancelled error", async ({ page }) => {
    // Dismissing the platform sheet rejects `navigator.credentials` with a
    // NotAllowedError DOMException. A virtual authenticator cannot be told to refuse,
    // so the rejection itself is injected and the whole path after it is real: the
    // module maps it, the kit rejects `authModal`, and the app renders the IKitError.
    await page.addInitScript(() => {
      const reject = () => Promise.reject(new DOMException("The operation is not allowed", "NotAllowedError"));
      Object.defineProperty(navigator, "credentials", {
        configurable: true,
        value: { create: reject, get: reject },
      });
    });
    await page.goto("/?mode=local");
    await page.getByTestId("connect").click();
    await modal(page).click();

    await expect(page.getByTestId("error")).toContainText("code=-1", { timeout: 30_000 });
    await expect(page.getByTestId("error")).toContainText("USER_CANCELLED");
    await page.screenshot({ path: "test-results/05-cancelled.png", fullPage: true });
  });
});
