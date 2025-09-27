import './app.css'
import preactLogo from './assets/preact.svg'
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk';
import { activeAddress, activeModule } from '@creit-tech/stellar-wallets-kit/state';
import { SwkButton } from '@creit-tech/stellar-wallets-kit/components';
import { AlbedoModule } from '@creit-tech/stellar-wallets-kit/modules/albedo';
import { FreighterModule } from '@creit-tech/stellar-wallets-kit/modules/freighter';
import { HanaModule } from '@creit-tech/stellar-wallets-kit/modules/hana';
import { LedgerModule } from '@creit-tech/stellar-wallets-kit/modules/ledger';
import { LobstrModule } from '@creit-tech/stellar-wallets-kit/modules/lobstr';
import { RabetModule } from '@creit-tech/stellar-wallets-kit/modules/rabet';
import { xBullModule } from '@creit-tech/stellar-wallets-kit/modules/xbull';

StellarWalletsKit.init({
  modules: [
    new AlbedoModule(),
    new FreighterModule(),
    new HanaModule(),
    new LedgerModule(),
    new LobstrModule(),
    new RabetModule(),
    new xBullModule(),
  ],
});

async function authModal(): Promise<void> {
  try {
    const { address } = await StellarWalletsKit.authModal();
    console.log(`Address fetched: ${address}`);
  } catch (e) {
    console.error(e);
  }
}

export function App() {
  return (
    <>
      <img src="/vite-deno.svg" alt="Vite with Deno" />
      <div>
        <img src="/vite.svg" class="logo" alt="Vite logo" />
        <img src={preactLogo} class="logo preact" alt="Preact logo" />
      </div>
      <h1>Vite + Preact</h1>
      <div class="card">
        <button onClick={authModal}>
          Connect Wallet
        </button>

        <br/>
        <br/>

        <SwkButton />

        <p>
          Your selected wallet is: <br/> {activeModule.value?.productName}
        </p>
        <p>
          Your account is: <br/> {activeAddress.value && `${activeAddress.value.slice(0, 4)}....${activeAddress.value.slice(-6)}`}
        </p>
      </div>
      <p class="read-the-docs">
        {/*Learn more */}
      </p>
    </>
  )
}
