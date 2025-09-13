import { tw, cx, reset } from "./twind.ts";
import type { VNode } from "preact";
import { html } from "htm/preact";
import { Header } from "./shared/header.ts";
import { Footer } from "./shared/footer.ts";
import { closeEvent, mode, route } from "../state/mod.ts";
import { SwkAppMode, SwkAppRoute } from "../types/mod.ts";
import { AuthOptionsPage } from "./pages/auth-options.page.ts";
import { WhatIsAWalletPage } from "./pages/what-is-a-wallet.page.ts";
import { MultiPageAnimator } from "./router.ts";
import { ProfilePage } from './pages/profile.page.ts';

const pages: Record<SwkAppRoute, () => VNode> = {
  [SwkAppRoute.AUTH_OPTIONS]: AuthOptionsPage,
  [SwkAppRoute.HELP_PAGE]: WhatIsAWalletPage,
  [SwkAppRoute.PROFILE_PAGE]: ProfilePage,
};

export function SwkApp(): VNode {
  const kitsClasses: string = tw(cx([
    mode.value === SwkAppMode.FIXED
      ? "fixed flex left-0 top-0 z-[9999] w-full h-full"
      : "inline-flex",
    'font-default justify-center items-center'
  ]));

  return html`
    <section class="stellar-wallets-kit ${kitsClasses} ${tw(reset)}">
      ${mode.value === SwkAppMode.FIXED
        ? html`
          <div class="${tw('absolute left-0 top-0 z-0 w-full h-full bg-[rgba(0,0,0,0.5)]')}"
               onClick="${() => closeEvent.next()}"></div>
        `
        : ""}

      <section
        class="${tw('w-full h-fit relative max-w-[22rem] max-h-[39.4375rem] grid grid-cols-1 grid-rows-[auto_1fr_auto] bg-background rounded-default shadow-default transition-all duration-[0.5s] ease-in-out overflow-hidden')}"
      >
        <div class="${tw('col-span-1')}">
          <${Header} />
        </div>

        <div class="${tw('col-span-1')}">
          <${MultiPageAnimator}
            currentRoute="${route.value}"
            pages="${pages}"
            duration="${400}"
          />
        </div>

        <div class="${tw('col-span-1')}">
          <${Footer} />
        </div>
      </section>
    </section>
  `;
}
