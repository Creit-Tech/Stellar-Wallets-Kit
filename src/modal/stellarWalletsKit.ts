import { ThemeConfig, defaultThemeConfig } from './themeConfig';
import { applyModalStyles } from './modalStyles';
import { WalletNetwork }  from '@creit.tech/stellar-wallets-kit';

interface StellarWalletsKitParams {
  network: WalletNetwork;
  selectedWalletId: string;
  modules: any[];
  themeConfig?: ThemeConfig;
}

export class StellarWalletsKit {
  private themeConfig: ThemeConfig;

  constructor(options: StellarWalletsKitParams) {
    this.themeConfig = options.themeConfig || defaultThemeConfig;
  }

  public applyThemeConfigToModal(modalElement: HTMLElement) {
    if (!this.themeConfig.autoModeSwitch) {
      applyModalStyles(modalElement, this.themeConfig.colors);
    } else {
      const mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode';
      modalElement.classList.add(mode);
    }
  }

  // Other methods...
}

