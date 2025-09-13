import type { SwkAppTheme } from './components.ts';
import type { ModuleInterface, Networks } from './mod.ts';

export interface StellarWalletsKitInitParams {
  modules: ModuleInterface[];
  selectedWalletId?: string;
  network?: Networks;
  theme?: SwkAppTheme;

  authModal?: {
    showInstallLabel?: boolean;
    hideUnsupportedWallets?: boolean;
  };
  profileModal?: ProfileModalParams;
}

export type AuthModalParams = {
  container?: HTMLElement;
};

export type ProfileModalParams = {
  container?: HTMLElement;
};
