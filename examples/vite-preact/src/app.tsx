import './app.css'
import preactLogo from './assets/preact.svg'
import { StellarWalletsKit } from '@stellar-wallets-kit/sdk';
import { activeAddress } from '@stellar-wallets-kit/state';
import { xBullModule } from '@stellar-wallets-kit/sdk/modules/xbull';
import { HanaModule } from '@stellar-wallets-kit/sdk/modules/hana';
import { RabetModule } from '@stellar-wallets-kit/sdk/modules/rabet';

const kit: StellarWalletsKit = new StellarWalletsKit({
  modules: [
    new xBullModule(),
    new HanaModule(),
    new RabetModule(),
  ],
});

async function authModal(): Promise<void> {
  try {
    const { address } = await kit.authModal();
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
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <a href="https://preactjs.com" target="_blank">
          <img src={preactLogo} class="logo preact" alt="Preact logo" />
        </a>
      </div>
      <h1>Vite + Preact</h1>
      <div class="card">
        <button onClick={() => authModal()}>
          Connect
        </button>
        <p>
          Your wallet is: <br/> {activeAddress.value}
        </p>
      </div>
      <p class="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </>
  )
}
