import { StellarWalletsButton } from './button/stellar-wallets-button';
import { StellarWalletsModal } from './modal/stellar-wallets-modal';
import { StellarSelectorModal } from './selector-modal/stellar-selector-modal';

declare global {
  interface HTMLElementTagNameMap {
    'stellar-wallets-modal': StellarWalletsModal;
    'stellar-wallets-button': StellarWalletsButton;
    'stellar-selector-modal': StellarSelectorModal;
  }
}
