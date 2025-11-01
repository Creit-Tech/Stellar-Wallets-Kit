import { KitEventType, SwkAppDarkTheme } from "@creit-tech/stellar-wallets-kit/types";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { activeAddress, activeModule, } from "@creit-tech/stellar-wallets-kit/state";
import { AlbedoModule } from "@creit-tech/stellar-wallets-kit/modules/albedo";
import { FreighterModule } from "@creit-tech/stellar-wallets-kit/modules/freighter";
import { HanaModule } from "@creit-tech/stellar-wallets-kit/modules/hana";
import { LedgerModule } from "@creit-tech/stellar-wallets-kit/modules/ledger";
import { LobstrModule } from "@creit-tech/stellar-wallets-kit/modules/lobstr";
import { RabetModule } from "@creit-tech/stellar-wallets-kit/modules/rabet";
import { TrezorModule } from "@creit-tech/stellar-wallets-kit/modules/trezor";
import { xBullModule } from "@creit-tech/stellar-wallets-kit/modules/xbull";
import { WalletConnectModule } from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";

import { Account, Networks, Operation, TransactionBuilder, } from "@stellar/stellar-sdk";

import { Component } from 'react'
import './App.css'

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
      appName: "Stellar Wallets Kit",
      appUrl: "http://localhost:5173",
      email: "test@email.com",
    }),
    new xBullModule(),
    new WalletConnectModule({
      projectId: "4e0b84f6ba6bedf7c7f041d919a9f039",
      metadata: {
        name: "Stellar Wallets Kit",
        description: "Add support to all Stellar Wallets with a single library",
        icons: [],
        url: 'http://localhost:5173/',
      }
    }),
  ],
});

export class App extends Component<any, any> {
  state = {
    address: activeAddress.value,
    moduleId: activeModule.value?.productId,
  };

  componentDidMount(): void {
    /**
     * IMPORTANT: In this example we are not destroying these subscriptions,
     * in your app you should do it when components are unmount.
     */
    StellarWalletsKit.on(KitEventType.STATE_UPDATED, event => {
      console.log(`Address updated:`, event.payload.address);
      this.setState({address: event.payload.address});
    });
    StellarWalletsKit.on(KitEventType.WALLET_SELECTED, event => {
      console.log(`Wallet ID:`, event.payload.id);
      this.setState({moduleId: event.payload.id});
    });
    StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
      this.setState({address: undefined, productName: undefined});
    });
    StellarWalletsKit.createButton(document.querySelector('#button')!);
  }

  async authModal(): Promise<void> {
    try {
      const {address} = await StellarWalletsKit.authModal();
      console.log(`Address fetched:`, address);
    } catch (e) {
      console.error(e);
    }
  }

  async disconnect(): Promise<void> {
    StellarWalletsKit.disconnect();
  }

  async signTransaction(): Promise<void> {
    const {address} = await StellarWalletsKit.getAddress();
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

    const {signedTxXdr} = await StellarWalletsKit.signTransaction(tx.toXDR(), {
      networkPassphrase: Networks.PUBLIC,
      address,
    });

    console.log("Signed Transaction:", signedTxXdr);
  }

  render() {
    return (
      <>
        <h1>Vite + React</h1>
        <div className="card">
          <section>
            <div>
              <button onClick={ () => this.authModal() }>
                Connect Wallet
              </button>

              <button onClick={ () => this.disconnect() }>
                Disconnect
              </button>

              <button onClick={ () => this.signTransaction() }>
                Sign transaction
              </button>

              <button onClick={ () => StellarWalletsKit.profileModal() }>
                Profile Modal
              </button>
            </div>

            <div>
              <p>
                Your selected wallet is: <br/> { this.state.moduleId }
              </p>
              <p>
                Your account is: <br/> { this.state.address &&
                `${ this.state.address.slice(0, 4) }....${ this.state.address.slice(-6) }` }
              </p>

              <div style={ {marginBottom: '3rem'} }></div>

              <div>
                <p>This is the built button, it follows the theme configured in the kit:</p>
                <div id="button"></div>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }
}

export default App
