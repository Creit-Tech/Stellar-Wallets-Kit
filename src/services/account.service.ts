import { firstValueFrom } from 'rxjs';
import { horizonUrl$ } from '../state/store';

export async function fetchAccountBalance(pk: string): Promise<string> {
  const horizonUrl: string | undefined = await firstValueFrom(horizonUrl$);
  if (!horizonUrl) {
    throw new Error('There is no Horizon URL set');
  }
  const url: URL = new URL(horizonUrl);
  url.pathname = `/accounts/${pk}`;
  const response: Response = await fetch(url);
  const data = await response.json();
  const nativeBalance = data.balances.find((b: { asset_type: string }): boolean => b.asset_type === 'native');
  return nativeBalance.balance;
}
