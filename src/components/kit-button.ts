import { tw, reset } from "./twind.ts";
import type { VNode } from "preact";
import { html } from "htm/preact";
import { Button, ButtonMode, ButtonShape } from "./shared/mod.ts";
import { activeModule, activeModules, activeAddress } from '../state/mod.ts';
import { StellarWalletsKit } from '../sdk/kit.ts';

export type SwkButtonProps = {
  onClick?: () => void;
  children?: any;
};

async function handleOnClick(cb: SwkButtonProps['onClick']): Promise<void> {
  if (cb) cb();

  if (typeof activeModules.value === 'undefined') throw new Error(`The kit hasn't been initiated.`);

  if (!activeModule.value || !activeAddress.value) {
    await StellarWalletsKit.authModal();
  } else {
    await StellarWalletsKit.profileModal();
  }
}

export function SwkButton(props: SwkButtonProps): VNode {
  const content: string = activeAddress.value
    ? `${activeAddress.value.slice(0, 4)}....${activeAddress.value.slice(-6)}`
    : 'Connect Wallet';

  return html`
    <div class="${tw(reset)} ${tw('inline-block')}">
      <${Button} mode="${ButtonMode.primary}" shape="${ButtonShape.regular}" onClick=${() => handleOnClick(props.onClick)}>
        ${props.children ? props.children : content}
      <//>
    </div>
  `;
}
