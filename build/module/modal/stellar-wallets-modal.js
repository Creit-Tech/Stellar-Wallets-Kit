var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { customElement, property, state } from 'lit/decorators.js';
import { StellarWalletsKit, WalletType } from '../lib/stellar-wallets-kit';
import { backdropStyles, layoutStyles, modalDialogStyles, modalOpenAnimation } from './styles';
let StellarWalletsModal = class StellarWalletsModal extends LitElement {
    constructor() {
        super(...arguments);
        this.showModal = false;
        this.modalTitle = 'Connect a Wallet';
        this.notAvailableText = 'Not available';
        this.allowedWallets = Object.values(WalletType);
        this.modalDialogStyles = { zIndex: 990 };
        this.availableWallets = [];
    }
    static { this.styles = [
        css `
      :host * {
        box-sizing: border-box;
      }
    `,
        modalDialogStyles,
        backdropStyles,
        modalOpenAnimation,
        layoutStyles
    ]; }
    connectedCallback() {
        super.connectedCallback();
        this.updateAvailableWallets();
    }
    closeModal() {
        this.showModal = false;
        this.dispatchEvent(new CustomEvent('modal-closed', {
            detail: new Error('Modal closed'),
            bubbles: true,
            composed: true
        }));
    }
    updateAvailableWallets() {
        StellarWalletsKit.getSupportedWallets()
            .then(value => this.availableWallets = value);
    }
    pickWalletOption(option) {
        if (!option.isAvailable) {
            return;
        }
        this.dispatchEvent(new CustomEvent('wallet-selected', {
            detail: option,
            bubbles: true,
            composed: true
        }));
    }
    render() {
        return html `
      <dialog style=${styleMap(this.modalDialogStyles)}
              class='dialog-modal' .open=${this.showModal}>

        <section class='layout'>
          <header class='layout-header'>
            <h2 class='layout-header__modal-title'>
              ${this.modalTitle}
            </h2>

            <button @click=${() => this.closeModal()}
                    class='layout-header__button'>
              x
            </button>
          </header>

          <ul class='layout-body'>
            ${this.availableWallets
            .filter(item => this.allowedWallets.find(aw => aw === item.type))
            .map((item) => html `
                  <li @click=${() => this.pickWalletOption(item)}
                      class='layout-body__item ${!item.isAvailable ? 'not-available' : ''}'>
                    <img src=${item.icon} alt=${item.name}>
                    ${item.name}

                    ${!item.isAvailable ? html `<small class='not-available'>${this.notAvailableText}</small>` : ''}
                  </li>
                `)}
          </ul>

          <footer class='layout-footer'>
            Stellar Wallets Kit by Creit Technologies LLP
          </footer>
        </section>

      </dialog>

      <div style='position: fixed; z-index: 950'
           class='backdrop'
           @click=${() => this.closeModal()}>
      </div>
    `;
    }
};
__decorate([
    property({ type: Boolean, reflect: true })
], StellarWalletsModal.prototype, "showModal", void 0);
__decorate([
    property({ type: String, reflect: true })
], StellarWalletsModal.prototype, "modalTitle", void 0);
__decorate([
    property({ type: String, reflect: true })
], StellarWalletsModal.prototype, "notAvailableText", void 0);
__decorate([
    property({
        type: Array,
        reflect: true,
        converter: { fromAttribute: (v) => JSON.parse(v) },
    })
], StellarWalletsModal.prototype, "allowedWallets", void 0);
__decorate([
    property({
        converter: {
            fromAttribute: (v) => (v && { ...JSON.parse(v), zIndex: 990 }),
        }
    })
], StellarWalletsModal.prototype, "modalDialogStyles", void 0);
__decorate([
    state()
], StellarWalletsModal.prototype, "availableWallets", void 0);
StellarWalletsModal = __decorate([
    customElement('stellar-wallets-modal')
], StellarWalletsModal);
export { StellarWalletsModal };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlbGxhci13YWxsZXRzLW1vZGFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGFsL3N0ZWxsYXItd2FsbGV0cy1tb2RhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDNUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRW5FLE9BQU8sRUFFTCxpQkFBaUIsRUFDakIsVUFBVSxFQUNYLE1BQU0sNEJBQTRCLENBQUM7QUFDcEMsT0FBTyxFQUNMLGNBQWMsRUFDZCxZQUFZLEVBQ1osaUJBQWlCLEVBQ2pCLGtCQUFrQixFQUNuQixNQUFNLFVBQVUsQ0FBQztBQUdsQixJQUFhLG1CQUFtQixHQUFoQyxNQUFhLG1CQUFvQixTQUFRLFVBQVU7SUFBbkQ7O1FBY0UsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUdsQixlQUFVLEdBQUcsa0JBQWtCLENBQUM7UUFHaEMscUJBQWdCLEdBQUcsZUFBZSxDQUFDO1FBT25DLG1CQUFjLEdBQWlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFPekQsc0JBQWlCLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFHNUIscUJBQWdCLEdBQXVCLEVBQUUsQ0FBQztJQW9GcEQsQ0FBQztJQXhIQyxTQUFnQixXQUFNLEdBQUc7UUFDdkIsR0FBRyxDQUFBOzs7O0tBSUY7UUFDRCxpQkFBaUI7UUFDakIsY0FBYztRQUNkLGtCQUFrQjtRQUNsQixZQUFZO0tBQ1osQ0FBQSxFQUFBO0lBNEJPLGlCQUFpQjtRQUN4QixLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsc0JBQXNC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QUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7U0FDdkU7S0FDRixDQUFDOzhEQUNrQztBQUdwQztJQURDLEtBQUssRUFBRTs2REFDMEM7QUFyQ3ZDLG1CQUFtQjtJQUQvQixhQUFhLENBQUMsdUJBQXVCLENBQUM7R0FDMUIsbUJBQW1CLENBeUgvQjtTQXpIWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMaXRFbGVtZW50LCBodG1sLCBjc3MgfSBmcm9tICdsaXQnO1xuaW1wb3J0IHsgc3R5bGVNYXAgfSBmcm9tICdsaXQvZGlyZWN0aXZlcy9zdHlsZS1tYXAuanMnO1xuaW1wb3J0IHsgY3VzdG9tRWxlbWVudCwgcHJvcGVydHksIHN0YXRlIH0gZnJvbSAnbGl0L2RlY29yYXRvcnMuanMnO1xuXG5pbXBvcnQge1xuICBJU3VwcG9ydGVkV2FsbGV0LFxuICBTdGVsbGFyV2FsbGV0c0tpdCxcbiAgV2FsbGV0VHlwZVxufSBmcm9tICcuLi9saWIvc3RlbGxhci13YWxsZXRzLWtpdCc7XG5pbXBvcnQge1xuICBiYWNrZHJvcFN0eWxlcyxcbiAgbGF5b3V0U3R5bGVzLFxuICBtb2RhbERpYWxvZ1N0eWxlcyxcbiAgbW9kYWxPcGVuQW5pbWF0aW9uXG59IGZyb20gJy4vc3R5bGVzJztcblxuQGN1c3RvbUVsZW1lbnQoJ3N0ZWxsYXItd2FsbGV0cy1tb2RhbCcpXG5leHBvcnQgY2xhc3MgU3RlbGxhcldhbGxldHNNb2RhbCBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgb3ZlcnJpZGUgc3R5bGVzID0gW1xuICAgIGNzc2BcbiAgICAgIDpob3N0ICoge1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgfVxuICAgIGAsXG4gICAgbW9kYWxEaWFsb2dTdHlsZXMsXG4gICAgYmFja2Ryb3BTdHlsZXMsXG4gICAgbW9kYWxPcGVuQW5pbWF0aW9uLFxuICAgIGxheW91dFN0eWxlc1xuICBdO1xuXG4gIEBwcm9wZXJ0eSh7IHR5cGU6IEJvb2xlYW4sIHJlZmxlY3Q6IHRydWUgfSlcbiAgc2hvd01vZGFsID0gZmFsc2U7XG5cbiAgQHByb3BlcnR5KHsgdHlwZTogU3RyaW5nLCByZWZsZWN0OiB0cnVlIH0pXG4gIG1vZGFsVGl0bGUgPSAnQ29ubmVjdCBhIFdhbGxldCc7XG5cbiAgQHByb3BlcnR5KHsgdHlwZTogU3RyaW5nLCByZWZsZWN0OiB0cnVlIH0pXG4gIG5vdEF2YWlsYWJsZVRleHQgPSAnTm90IGF2YWlsYWJsZSc7XG5cbiAgQHByb3BlcnR5KHtcbiAgICB0eXBlOiBBcnJheSxcbiAgICByZWZsZWN0OiB0cnVlLFxuICAgIGNvbnZlcnRlcjogeyBmcm9tQXR0cmlidXRlOiAodjogc3RyaW5nKSA9PiBKU09OLnBhcnNlKHYpIH0sXG4gIH0pXG4gIGFsbG93ZWRXYWxsZXRzOiBXYWxsZXRUeXBlW10gPSBPYmplY3QudmFsdWVzKFdhbGxldFR5cGUpO1xuXG4gIEBwcm9wZXJ0eSh7XG4gICAgY29udmVydGVyOiB7XG4gICAgICBmcm9tQXR0cmlidXRlOiAodjogc3RyaW5nKSA9PiAodiAmJiB7IC4uLkpTT04ucGFyc2UodiksIHpJbmRleDogOTkwIH0pLFxuICAgIH1cbiAgfSlcbiAgbW9kYWxEaWFsb2dTdHlsZXMgPSB7IHpJbmRleDogOTkwIH07XG5cbiAgQHN0YXRlKClcbiAgcHJpdmF0ZSBhdmFpbGFibGVXYWxsZXRzOiBJU3VwcG9ydGVkV2FsbGV0W10gPSBbXTtcblxuICBvdmVycmlkZSBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIHRoaXMudXBkYXRlQXZhaWxhYmxlV2FsbGV0cygpO1xuICB9XG5cbiAgY2xvc2VNb2RhbCgpIHtcbiAgICB0aGlzLnNob3dNb2RhbCA9IGZhbHNlO1xuXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50KCdtb2RhbC1jbG9zZWQnLCB7XG4gICAgICAgIGRldGFpbDogbmV3IEVycm9yKCdNb2RhbCBjbG9zZWQnKSxcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY29tcG9zZWQ6IHRydWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHVwZGF0ZUF2YWlsYWJsZVdhbGxldHMoKSB7XG4gICAgU3RlbGxhcldhbGxldHNLaXQuZ2V0U3VwcG9ydGVkV2FsbGV0cygpXG4gICAgICAudGhlbih2YWx1ZSA9PiB0aGlzLmF2YWlsYWJsZVdhbGxldHMgPSB2YWx1ZSk7XG4gIH1cblxuICBwaWNrV2FsbGV0T3B0aW9uKG9wdGlvbjogSVN1cHBvcnRlZFdhbGxldCkge1xuICAgIGlmICghb3B0aW9uLmlzQXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50KCd3YWxsZXQtc2VsZWN0ZWQnLCB7XG4gICAgICAgIGRldGFpbDogb3B0aW9uLFxuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjb21wb3NlZDogdHJ1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgcmVuZGVyKCkge1xuICAgIHJldHVybiBodG1sYFxuICAgICAgPGRpYWxvZyBzdHlsZT0ke3N0eWxlTWFwKHRoaXMubW9kYWxEaWFsb2dTdHlsZXMpfVxuICAgICAgICAgICAgICBjbGFzcz0nZGlhbG9nLW1vZGFsJyAub3Blbj0ke3RoaXMuc2hvd01vZGFsfT5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzcz0nbGF5b3V0Jz5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzPSdsYXlvdXQtaGVhZGVyJz5cbiAgICAgICAgICAgIDxoMiBjbGFzcz0nbGF5b3V0LWhlYWRlcl9fbW9kYWwtdGl0bGUnPlxuICAgICAgICAgICAgICAke3RoaXMubW9kYWxUaXRsZX1cbiAgICAgICAgICAgIDwvaDI+XG5cbiAgICAgICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZU1vZGFsKCl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPSdsYXlvdXQtaGVhZGVyX19idXR0b24nPlxuICAgICAgICAgICAgICB4XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2hlYWRlcj5cblxuICAgICAgICAgIDx1bCBjbGFzcz0nbGF5b3V0LWJvZHknPlxuICAgICAgICAgICAgJHt0aGlzLmF2YWlsYWJsZVdhbGxldHNcbiAgICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IHRoaXMuYWxsb3dlZFdhbGxldHMuZmluZChhdyA9PiBhdyA9PT0gaXRlbS50eXBlKSlcbiAgICAgICAgICAgICAgLm1hcCgoaXRlbSkgPT5cbiAgICAgICAgICAgICAgICBodG1sYFxuICAgICAgICAgICAgICAgICAgPGxpIEBjbGljaz0keygpID0+IHRoaXMucGlja1dhbGxldE9wdGlvbihpdGVtKX1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0nbGF5b3V0LWJvZHlfX2l0ZW0gJHshaXRlbS5pc0F2YWlsYWJsZSA/ICdub3QtYXZhaWxhYmxlJyA6ICcnfSc+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPSR7aXRlbS5pY29ufSBhbHQ9JHtpdGVtLm5hbWV9PlxuICAgICAgICAgICAgICAgICAgICAke2l0ZW0ubmFtZX1cblxuICAgICAgICAgICAgICAgICAgICAkeyFpdGVtLmlzQXZhaWxhYmxlID8gaHRtbGA8c21hbGwgY2xhc3M9J25vdC1hdmFpbGFibGUnPiR7dGhpcy5ub3RBdmFpbGFibGVUZXh0fTwvc21hbGw+YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICBgXG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgPC91bD5cblxuICAgICAgICAgIDxmb290ZXIgY2xhc3M9J2xheW91dC1mb290ZXInPlxuICAgICAgICAgICAgU3RlbGxhciBXYWxsZXRzIEtpdCBieSBDcmVpdCBUZWNobm9sb2dpZXMgTExQXG4gICAgICAgICAgPC9mb290ZXI+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPC9kaWFsb2c+XG5cbiAgICAgIDxkaXYgc3R5bGU9J3Bvc2l0aW9uOiBmaXhlZDsgei1pbmRleDogOTUwJ1xuICAgICAgICAgICBjbGFzcz0nYmFja2Ryb3AnXG4gICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMuY2xvc2VNb2RhbCgpfT5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgSFRNTEVsZW1lbnRUYWdOYW1lTWFwIHtcbiAgICAnc3RlbGxhci13YWxsZXRzLW1vZGFsJzogU3RlbGxhcldhbGxldHNNb2RhbDtcbiAgfVxufVxuIl19