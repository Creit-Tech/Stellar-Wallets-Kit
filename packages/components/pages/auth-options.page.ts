import type { VNode } from "preact";
import { html } from "htm/preact";
import {
  activeModules,
  addressUpdatedEvent,
  allowedWallets,
  installText,
  moduleSelectedEvent,
  selectedModuleId,
  showInstallLabel,
} from "@stellar-wallets-kit/state";
import { computed, type ReadonlySignal } from "@preact/signals";
import type { ISupportedWallet, ModuleInterface } from "@stellar-wallets-kit/types";
import { Avatar, AvatarSize } from "../shared/avatar.ts";
import { tw } from '../twind.ts';
import { activeAddress } from '../../state/values.ts';

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

  const usedWalletsIds: Array<ISupportedWallet["id"]> = [];
  // const usedWalletsIds: Array<Wallet['id']> = this.walletsService.usedWallets();
  if (usedWalletsIds.length === 0) {
    return [...tempSortedWallets.available, ...tempSortedWallets.unavailable];
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

  const module: ModuleInterface = activeModules.value
    .find((m: ModuleInterface): boolean => m.productId === item.id)!;

  try {
    const { address } = await module.getAddress();
    activeAddress.value = address;
    addressUpdatedEvent.next(address);
  } catch (e) {
    addressUpdatedEvent.next(e as any);
  }
}

export function AuthOptionsPage(): VNode {
  return html`
    <ul class="${tw('w-full grid gap-2 px-2 py-4')}">
      ${sortedWallet.value.map((wallet: ISupportedWallet) => {
        return html`
          <li
            onClick="${() => onWalletSelected(wallet)}"
            class="${tw('px-2 py-2 cursor-pointer flex justify-between items-center bg-background hover:border-light-gray border-1 border-transparent rounded-default duration-150 ease active:bg-background active:border-gray')}"
          >
            <div class="${tw('flex items-center gap-2')}">
              <${Avatar} class="${tw('mr-2')}" alt="${wallet.name} icon" image="${wallet.icon}" size="${AvatarSize.sm}" />
              <p class="${tw('text-foreground font-semibold')}">${wallet.name}</p>
            </div>

            ${showInstallLabel.value && !wallet.isAvailable
              ? html`
                <div class="${tw('ml-4 flex items-center')}">
                  <small
                    class="${tw('inline-flex items-center border-1 border-border px-2 py-1 rounded-default text-foreground-secondary text-xs bg-background-secondary')}"
                  >
                    ${installText.value}
                    
                    <svg class="${tw('w-4 h-4')}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z"></path>
                    </svg>
                  </small>
                </div>
              `
              : ""}
          </li>
        `;
      })}
    </ul>
  `;
}
