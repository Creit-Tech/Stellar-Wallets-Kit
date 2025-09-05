import preactLogo from './assets/preact.svg'
import { StellarWalletsKit } from '@stellar-wallets-kit/sdk';
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
    <section class="max-w-[62rem] mx-auto p-[2rem] flex flex-col items-center justify-center">
      <img class="mx-auto" src="/vite-deno.svg" alt="Vite with Deno" />
      <div class="w-full flex flex gap-16 justify-center items-center mb-8">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" class="h-[6rem]" alt="Vite logo" />
        </a>
        <a href="https://preactjs.com" target="_blank">
          <img src={preactLogo} class="h-[6rem]" alt="Preact logo" />
        </a>
      </div>

      <h1 class="text-2xl">Vite + Preact</h1>

      <div class="p-[2rem] flex flex-col gap-4">
        <button class="border-1 border-gray-500 py-2 px-8 max-w-fit rounded-lg mx-auto hover:bg-gray-600 ease-in-out transition-all mb-4"
                type="button"
                onClick={() => authModal()}>
          Connect
        </button>

        <p>
          Edit <code>src/app.tsx</code> and save to test HMR
        </p>
      </div>
      <p class="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </section>
  )
}
