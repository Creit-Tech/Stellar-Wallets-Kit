import { cx, reset, tw } from "./twind.ts";
import { css } from "@twind/core";
import type { VNode } from "preact";
import { html } from "htm/preact";
import { Header } from "./shared/header.ts";
import { Footer } from "./shared/footer.ts";
import { closeEvent, mode, route } from "../state/mod.ts";
import { SwkAppMode, SwkAppRoute } from "../types/mod.ts";
import { AuthOptionsPage } from "./pages/auth-options.page.ts";
import { WhatIsAWalletPage } from "./pages/what-is-a-wallet.page.ts";
import { MultiPageAnimator } from "./router.ts";
import { ProfilePage } from "./pages/profile.page.ts";
import { HwAccountsFetcherPage } from "./pages/hw-accounts-fetcher.page.ts";

const pages: Record<SwkAppRoute, any> = {
  [SwkAppRoute.AUTH_OPTIONS]: AuthOptionsPage,
  [SwkAppRoute.HELP_PAGE]: WhatIsAWalletPage,
  [SwkAppRoute.PROFILE_PAGE]: ProfilePage,
  [SwkAppRoute.HW_ACCOUNTS_FETCHER]: HwAccountsFetcherPage,
};

const glass = css`
  .glass {
    backdrop-filter: blur(10px);
    background-color: color-mix(in srgb, var(--swk-background) 25%, transparent);
  }
`;

export function SwkApp(): VNode {
  const kitsClasses: string = tw(cx([
    mode.value === SwkAppMode.FIXED ? "fixed flex left-0 top-0 z-[999] w-full h-full" : "inline-flex",
    "font-default justify-center items-center",
  ]));

  return html`
    <section class="stellar-wallets-kit ${kitsClasses} ${tw(reset)} ${tw(glass)}">
      ${mode.value === SwkAppMode.FIXED
        ? html`
          <div class="${tw("absolute left-0 top-0 z-0 w-full h-full bg-[rgba(0,0,0,0.5)]")}" onClick="${() =>
            closeEvent.next()}"></div>
        `
        : ""}

      <section
        class="${tw(
          "w-full h-fit relative max-w-[22rem] max-h-[39.4375rem] grid grid-cols-1 grid-rows-[auto_1fr_auto] bg-background rounded-default shadow-default transition-all duration-[0.5s] ease-in-out overflow-hidden max-h-[400px] overflow-y-scroll",
        )}"
      >
        <div class="${tw("col-span-1 top-0 sticky z-50")} glass">
          <${Header} />
        </div>

        <div class="${tw("col-span-1 relative z-10")}">
          <${MultiPageAnimator}
            currentRoute="${route.value}"
            pages="${pages}"
            duration="${400}"
          />
        </div>

        <div class="${tw("col-span-1 bottom-0 sticky z-50")} glass">
          <${Footer} />
        </div>
      </section>
    </section>
  `;
}
