import { StellarWalletsButton } from './button/stellar-wallets-button';
import { StellarWalletsModal } from './modal/stellar-wallets-modal';

declare global {
  interface HTMLElementTagNameMap {
    'stellar-wallets-modal': StellarWalletsModal;
    'stellar-wallets-button': StellarWalletsButton;
  }
}
