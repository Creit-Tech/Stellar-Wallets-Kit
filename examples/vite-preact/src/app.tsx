import './app.css'
import preactLogo from './assets/preact.svg'
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk';
import { activeAddress, activeModule } from '@creit-tech/stellar-wallets-kit/state';
import { SwkButton } from '@creit-tech/stellar-wallets-kit/components';
import { xBullModule } from '@creit-tech/stellar-wallets-kit/modules/xbull';
import { HanaModule } from '@creit-tech/stellar-wallets-kit/modules/hana';
import { RabetModule } from '@creit-tech/stellar-wallets-kit/modules/rabet';

StellarWalletsKit.init({
  modules: [
    new xBullModule(),
    new HanaModule(),
    new RabetModule(),
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
