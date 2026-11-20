import type { VNode } from "preact";
import { html } from "htm/preact";
import {
  activeAddress,
  activeModule,
  addressUpdatedEvent,
  allowedWallets,
  installText,
  modalTitle,
  moduleSelectedEvent,
  selectedModuleId,
  showInstallLabel,
} from "../../state/mod.ts";
import { computed, type ReadonlySignal } from "@preact/signals";
import { type ISupportedWallet, LocalStorageKeys, ModuleType, SwkAppRoute } from "../../types/mod.ts";
import { Avatar, AvatarSize } from "../shared/avatar.ts";
import { tw } from "../twind.ts";
import { css } from "@twind/core";
import { navigateTo } from "../router.ts";

const walletBtn = css`
  button.swk-wallet-logo {
    flex-shrink: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    cursor: pointer !important;
  }
  button.swk-wallet-btn {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    width: auto !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 0.75rem !important;
    padding: 0.875rem 1rem !important;
    border-radius: 1.25rem !important;
    background-color: var(--swk-background-secondary, #2c2c2e) !important;
    color: var(--swk-foreground, #f5f5f7) !important;
    border: 1px solid var(--swk-border, rgba(255, 255, 255, 0.1)) !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    cursor: pointer !important;
    text-align: left !important;
    transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease !important;
  }
  button.swk-wallet-btn p {
    color: inherit !important;
  }
  button.swk-wallet-btn:hover,
  button.swk-wallet-btn:focus-visible,
  button.swk-wallet-btn.is-selected {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: #ffffff !important;
    outline: none !important;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.28) !important;
  }
  button.swk-wallet-btn:active {
    background-color: #2563eb !important;
    border-color: #2563eb !important;
    color: #ffffff !important;
  }
  button.swk-wallet-btn:hover small,
  button.swk-wallet-btn:focus-visible small,
  button.swk-wallet-btn:active small,
  button.swk-wallet-btn.is-selected small {
    background-color: rgba(255, 255, 255, 0.18) !important;
    border-color: rgba(255, 255, 255, 0.35) !important;
    color: #ffffff !important;
  }
`;

const sortedWallet: ReadonlySignal<ISupportedWallet[]> = computed((): ISupportedWallet[] => {
  const tempSortedWallets: { available: ISupportedWallet[]; unavailable: ISupportedWallet[] } = allowedWallets.value
    .reduce(
      (all: { available: ISupportedWallet[]; unavailable: ISupportedWallet[] }, current: ISupportedWallet) => {
        return {
          available: current.isAvailable ? [...all.available, current] : all.available,
          unavailable: !current.isAvailable ? [...all.unavailable, current] : all.unavailable,
        };
      },
      { available: [], unavailable: [] },
    );

  let usedWalletsIds: Array<ISupportedWallet["id"]>;
  try {
    const record: string | null = globalThis?.localStorage.getItem(LocalStorageKeys.usedWalletsIds);
    usedWalletsIds = record ? JSON.parse(record) : [];
  } catch (e) {
    console.error(e);
    usedWalletsIds = [];
  }

  const usedWallets: ISupportedWallet[] = [];
  const nonUsedWallets: ISupportedWallet[] = [];
  for (const availableWallet of tempSortedWallets.available) {
    if (usedWalletsIds.find((id: string): boolean => id === availableWallet.id)) {
      usedWallets.push(availableWallet);
    } else {
      nonUsedWallets.push(availableWallet);
    }
  }

  return [
    ...usedWallets.sort((a: ISupportedWallet, b: ISupportedWallet): number => {
      return usedWalletsIds.indexOf(a.id) - usedWalletsIds.indexOf(b.id);
    }),
    ...nonUsedWallets,
    ...tempSortedWallets.unavailable,
  ];
});

async function onWalletSelected(item: ISupportedWallet): Promise<void> {
  if (!item.isAvailable) {
    globalThis.open(item.url, "_blank");
    return;
  }

  selectedModuleId.value = item.id;
  moduleSelectedEvent.next(item);

  if (item.type === ModuleType.HW_WALLET) {
    navigateTo(SwkAppRoute.HW_ACCOUNTS_FETCHER);
  } else {
    try {
      const { address } = await activeModule.value!.getAddress();
      activeAddress.value = address;
      addressUpdatedEvent.next(address);
    } catch (e) {
      addressUpdatedEvent.next(e as any);
    }
  }
}

export function AuthOptionsPage(): VNode {
  modalTitle.value = "Connect Wallet";

  // If the auth modal is rendered from a wallet wrapper, we assume the direct connection
  const wrapper: ISupportedWallet | undefined = sortedWallet.value.find((w: ISupportedWallet): boolean =>
    w.isPlatformWrapper
  );
  if (wrapper) {
    onWalletSelected(wrapper)
      .then();

    return html`
      <div class="${tw("w-full text-center px-4 py-8")}">
        <div class="${tw("w-full mb-4")}">
          <${Avatar} alt="${wrapper.name} icon" image="${wrapper.icon}" size="${AvatarSize.md}" />
        </div>

        <p class="${tw("text-foreground text-lg w-full")}">
          Connecting to your wallet using <b>${wrapper.name}</b>
        </p>
      </div>
    `;
  }

  const loadingMessage = html`
    <div class="${tw("w-full text-center text-foreground font-semibold p-4")}">Loading wallets...</div>
  `;

  const walletItem = sortedWallet.value.map((wallet: ISupportedWallet) => {
    return html`
      <${WalletOption} key="${wallet.id}" wallet=${wallet} />
    `;
  });

  return html`
    <ul class="${tw(walletBtn)} ${tw("w-full flex flex-col gap-2 px-3 py-3")}">
      ${sortedWallet.value.length === 0 ? loadingMessage : walletItem}
    </ul>
  `;
}

function WalletOption({ wallet }: { wallet: ISupportedWallet }): VNode {
  const isSelected = selectedModuleId.value === wallet.id;

  return html`
    <li class="${tw("w-full flex items-center gap-3")}">
      <button
        type="button"
        class="swk-wallet-logo"
        onClick="${() => onWalletSelected(wallet)}"
      >
        <${Avatar} alt="${wallet.name} icon" image="${wallet.icon}" size="${AvatarSize.md}" />
      </button>
      <button
        type="button"
        class="swk-wallet-btn ${isSelected ? "is-selected" : ""}"
        onClick="${() => onWalletSelected(wallet)}"
      >
        <p class="${tw("font-semibold truncate")}">${wallet.name}</p>

        ${showInstallLabel.value && !wallet.isAvailable
          ? html`
            <div class="${tw("ml-4 flex items-center shrink-0")}">
              <small
                class="${tw(
                  "inline-flex items-center border-1 border-border px-2 py-1 rounded-default text-foreground-secondary text-xs bg-background-secondary",
                )}"
              >
                ${installText.value}

                <svg class="${tw(
                  "w-4 h-4",
                )}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z"></path>
                </svg>
              </small>
            </div>
          `
          : ""}
      </button>
    </li>
  `;
}
