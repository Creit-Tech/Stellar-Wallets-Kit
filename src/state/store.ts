import { createStore, select, setProp, withProps } from '@ngneat/elf';
import { Observable } from 'rxjs';
import { ISupportedWallet, IModalTheme, WalletNetwork, IButtonTheme } from '../types';

export interface StateProps {
  allowedWallets: ISupportedWallet[];

  horizonUrl?: string;

  selectedNetwork?: WalletNetwork;
  selectedModuleId?: string;

  modalTheme?: IModalTheme;
  buttonTheme?: IButtonTheme;

  activeAddress?: string;
}

export const store = createStore(
  { name: 'state' },
  withProps<StateProps>({
    allowedWallets: [],
  })
);

export const allowedWallets$: Observable<ISupportedWallet[]> = store.pipe(
  select((state: StateProps) => state.allowedWallets)
);

export const modalTheme$: Observable<IModalTheme | undefined> = store.pipe(
  select((state: StateProps) => state.modalTheme)
);

export const buttonTheme$: Observable<IButtonTheme | undefined> = store.pipe(
  select((state: StateProps) => state.buttonTheme)
);

export const activeAddress$: Observable<string | undefined> = store.pipe(
  select((state: StateProps) => state.activeAddress)
);

export const horizonUrl$: Observable<string | undefined> = store.pipe(select((state: StateProps) => state.horizonUrl));

export function setSelectedModuleId(moduleId: Required<StateProps['selectedModuleId']>): void {
  store.update(setProp('selectedModuleId', moduleId));
}

export function setNetwork(network: WalletNetwork): void {
  if (!Object.values(WalletNetwork).includes(network)) {
    throw new Error(`Wallet network "${network}" is not supported`);
  }

  store.update(setProp('selectedNetwork', network));
}

export function setModalTheme(theme: IModalTheme): void {
  store.update(setProp('modalTheme', theme));
}

export function seButtonTheme(theme: IButtonTheme): void {
  store.update(setProp('buttonTheme', theme));
}

export function setAllowedWallets(data: ISupportedWallet[]) {
  store.update(setProp('allowedWallets', data));
}

export function setAddress(address: string): void {
  store.update(setProp('activeAddress', address));
}

export function removeAddress(): void {
  store.update(setProp('activeAddress', undefined));
}

export function setHorizonUrl(url: string): void {
  store.update(setProp('horizonUrl', url));
}
