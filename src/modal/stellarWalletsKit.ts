import { WalletNetwork } from '@creit.tech/stellar-wallets-kit';
import './mod.css'
import { ThemeConfig, defaultThemeConfig } from './themeConfig';

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
    this.applyThemeConfig();
  }

  private applyThemeConfig() {
    if (!this.themeConfig.autoModeSwitch) {
      for (const [key, value] of Object.entries(this.themeConfig.colors)) {
        document.documentElement.style.setProperty(`--${key}`, value);
      }
    } else {
      const mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode';
      document.documentElement.classList.add(mode);
    }
  }

  // Other methods...
}
