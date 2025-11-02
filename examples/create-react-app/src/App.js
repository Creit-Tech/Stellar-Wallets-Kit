import { SwkAppDarkTheme } from "@creit-tech/stellar-wallets-kit/types";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import {
  activeAddress,
  activeModule,
} from "@creit-tech/stellar-wallets-kit/state";
import { AlbedoModule } from "@creit-tech/stellar-wallets-kit/modules/albedo";
import { FreighterModule } from "@creit-tech/stellar-wallets-kit/modules/freighter";
import { HanaModule } from "@creit-tech/stellar-wallets-kit/modules/hana";
import { LobstrModule } from "@creit-tech/stellar-wallets-kit/modules/lobstr";
import { RabetModule } from "@creit-tech/stellar-wallets-kit/modules/rabet";
import { xBullModule } from "@creit-tech/stellar-wallets-kit/modules/xbull";

import {
  Account,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

StellarWalletsKit.init({
  theme: SwkAppDarkTheme,
  modules: [
    new AlbedoModule(),
    new FreighterModule(),
    new HanaModule(),
    new LobstrModule(),
    new RabetModule(),
    new xBullModule(),
  ],
});

function App() {
  const [ selectedAddress, setSelectedAddress ] = useState(activeAddress.value);
  const [ moduleName, setModuleName ] = useState(activeModule.value?.productName);

  async function authModal() {
    try {
      const { address } = await StellarWalletsKit.authModal();
      console.log(`Address fetched: ${ address }`);
      setSelectedAddress(address);
      setModuleName(activeModule.value.productName);
    } catch (e) {
      console.error(e);
    }
  }

  async function disconnect() {
    StellarWalletsKit.disconnect();
    setSelectedAddress(undefined);
    setModuleName(undefined);
  }

  async function signTransaction() {
    const { address } = await StellarWalletsKit.getAddress();
    console.log("StellarWalletsKit::getAddress", address);
    const tx = new TransactionBuilder(new Account(address, "-1"), {
      networkPassphrase: Networks.PUBLIC,
      fee: "0",
    })
      .setTimeout(0)
      .addOperation(
        Operation.manageData({
          name: "Hello",
          value: "World!",
        }),
      )
      .build();

    const { signedTxXdr } = await StellarWalletsKit.signTransaction(tx.toXDR(), {
      networkPassphrase: Networks.PUBLIC,
      address,
    });

    console.log("Signed Transaction:", signedTxXdr);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={ logo } className="App-logo" alt="logo"/>

        <section>
          <div>
            <button onClick={ authModal }>
              Connect Wallet
            </button>

            <button onClick={ disconnect }>
              Disconnect
            </button>

            <button onClick={ signTransaction }>
              Sign transaction
            </button>
          </div>

          <div>
            <p>
              Your selected wallet is: <br/> { moduleName }
            </p>
            <p>
              Your account is: <br/> { selectedAddress &&
              `${ selectedAddress.slice(0, 4) }....${ selectedAddress.slice(-6) }` }
            </p>
          </div>
        </section>
      </header>
    </div>
  );
}

export default App;
