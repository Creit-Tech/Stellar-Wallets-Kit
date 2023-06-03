import { LitElement } from 'lit';
import { ISupportedWallet } from '../lib/stellar-wallets-kit';
export declare class StellarWalletsModal extends LitElement {
    static styles: import("lit").CSSResult[];
    showModal: boolean;
    modalTitle: string;
    notAvailableText: string;
    private availableWallets;
    connectedCallback(): void;
    closeModal(): void;
    updateAvailableWallets(): void;
    pickWalletOption(option: ISupportedWallet): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'stellar-wallets-modal': StellarWalletsModal;
    }
}
//# sourceMappingURL=stellar-wallets-modal.d.ts.map