import './app.css'
import preactLogo from './assets/preact.svg'
import { SwkAppDarkTheme } from '@creit-tech/stellar-wallets-kit'
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk';
import { activeAddress, activeModule } from '@creit-tech/stellar-wallets-kit/state';
import { SwkButton } from '@creit-tech/stellar-wallets-kit/components';
import { AlbedoModule } from '@creit-tech/stellar-wallets-kit/modules/albedo';
import { FreighterModule } from '@creit-tech/stellar-wallets-kit/modules/freighter';
import { HanaModule } from '@creit-tech/stellar-wallets-kit/modules/hana';
import { LedgerModule } from '@creit-tech/stellar-wallets-kit/modules/ledger';
import { LobstrModule } from '@creit-tech/stellar-wallets-kit/modules/lobstr';
import { RabetModule } from '@creit-tech/stellar-wallets-kit/modules/rabet';
import { TrezorModule } from '@creit-tech/stellar-wallets-kit/modules/trezor';
import { xBullModule } from '@creit-tech/stellar-wallets-kit/modules/xbull';

import { Transaction, TransactionBuilder, Account, Networks, Operation } from '@stellar/stellar-sdk';

StellarWalletsKit.init({
  theme: SwkAppDarkTheme,
  modules: [
    new AlbedoModule(),
    new FreighterModule(),
    new HanaModule(),
    new LedgerModule(),
    new LobstrModule(),
    new RabetModule(),
    new TrezorModule({
      appName: 'Stellar Wallets Kit',
      appUrl: 'http://localhost:5173',
      email: 'test@email.com'
    }),
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

async function signTransaction(): Promise<void> {
  const { address } = await StellarWalletsKit.getAddress();
  console.log("StellarWalletsKit::getAddress", address);
  const tx: Transaction = new TransactionBuilder(new Account(address, '-1'), {
    networkPassphrase: Networks.PUBLIC,
    fee: '0',
  })
    .setTimeout(0)
    .addOperation(
      Operation.manageData({
        name: 'Hello',
        value: 'World!'
      })
    )
    .build();

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(tx.toXDR(), {
    networkPassphrase: Networks.PUBLIC,
    address,
  });

  console.log('Signed Transaction:', signedTxXdr);
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
        <div className="w-full flex justify-center items-center">
          <button style="margin-right: 2rem" onClick={authModal}>
            Connect Wallet
          </button>

          <SwkButton />
        </div>

        <p>
          Your selected wallet is: <br/> {activeModule.value?.productName}
        </p>
        <p>
          Your account is: <br/> {activeAddress.value && `${activeAddress.value.slice(0, 4)}....${activeAddress.value.slice(-6)}`}
        </p>
      </div>

      <div style="width: 100%;">
        <button onClick={signTransaction}>
          Sign Transaction
        </button>
      </div>
    </>
  )
}
