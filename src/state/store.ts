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
  mnemonicPath?: string;
  hardwareWalletPaths: { publicKey: string; index: number }[];
}

export const store = createStore(
  { name: 'state' },
  withProps<StateProps>({
    allowedWallets: [],
    hardwareWalletPaths: [],
  })
);

export const allowedWallets$: Observable<ISupportedWallet[]> = store.pipe(
  select((state: StateProps) => state.allowedWallets)
);

export const selectedNetwork$: Observable<StateProps['selectedNetwork']> = store.pipe(
  select((state: StateProps) => state.selectedNetwork)
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

export const mnemonicPath$: Observable<string | undefined> = store.pipe(
  select((state: StateProps) => state.mnemonicPath)
);

export const hardwareWalletPaths$: Observable<{ publicKey: string; index: number }[]> = store.pipe(
  select((state: StateProps) => state.hardwareWalletPaths)
);

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

export function setMnemonicPath(path: string): void {
  store.update(setProp('mnemonicPath', path));
}

export function removeMnemonicPath(): void {
  store.update(setProp('mnemonicPath', undefined));
}

export function setHardwareWalletPaths(accounts: { publicKey: string; index: number }[]): void {
  store.update(setProp('hardwareWalletPaths', accounts));
}

export function removeHardwareWalletPaths(): void {
  store.update(setProp('hardwareWalletPaths', []));
}
