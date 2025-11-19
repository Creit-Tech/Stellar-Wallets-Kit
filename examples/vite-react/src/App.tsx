import { Component } from "react";
import "./App.css";

import {
  KitEventType,
  SwkAppDarkTheme,
} from "@creit-tech/stellar-wallets-kit/types";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import {
  activeAddress,
  activeModule,
} from "@creit-tech/stellar-wallets-kit/state";
import { ButtonMode } from "@creit-tech/stellar-wallets-kit/components";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";
import { TrezorModule } from "@creit-tech/stellar-wallets-kit/modules/trezor";
import { LedgerModule } from "@creit-tech/stellar-wallets-kit/modules/ledger";
import { WalletConnectModule } from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";

import {
  Account,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

StellarWalletsKit.init({
  theme: {
    ...SwkAppDarkTheme,
    primary: "#1a1a1a",
    "primary-foreground": "rgba(255, 255, 255, 0.87)",
    "border-radius": "8px",
    shadow: "none",
    background: "#1a1a1a",
    foreground: "rgba(255, 255, 255, 0.87)",
  },
  modules: [
    ...defaultModules(),
    new LedgerModule(),
    new TrezorModule({
      appName: "Stellar Wallets Kit",
      appUrl: "http://localhost:5173",
      email: "test@email.com",
    }),
    new WalletConnectModule({
      projectId: "4e0b84f6ba6bedf7c7f041d919a9f039",
      metadata: {
        name: "Stellar Wallets Kit",
        description: "Add support to all Stellar Wallets with a single library",
        icons: [],
        url: "http://localhost:5173/",
      },
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
    StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      console.log(`Address updated:`, event.payload.address);
      this.setState({ address: event.payload.address });
    });
    StellarWalletsKit.on(KitEventType.WALLET_SELECTED, (event) => {
      console.log(`Wallet ID:`, event.payload.id);
      this.setState({ moduleId: event.payload.id });
    });
    StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
      this.setState({ address: undefined, productName: undefined });
    });
    StellarWalletsKit.createButton(document.querySelector("#button")!, {
      mode: ButtonMode.free,
    });
  }

  async authModal(): Promise<void> {
    try {
      const { address } = await StellarWalletsKit.authModal();
      console.log(`Address fetched:`, address);
    } catch (e) {
      console.error(e);
    }
  }

  async disconnect(): Promise<void> {
    StellarWalletsKit.disconnect();
  }

  async signTransaction(): Promise<void> {
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

    const { signedTxXdr } = await StellarWalletsKit.signTransaction(
      tx.toXDR(),
      {
        networkPassphrase: Networks.PUBLIC,
        address,
      },
    );

    console.log("Signed Transaction:", signedTxXdr);
  }

  async signAuthEntry(): Promise<void> {
    const { address } = await StellarWalletsKit.getAddress();
    const xdr =
      "AAAACXrDOZdUTjF10ma9AiQ5sizbFlCMARY/JuXLKj4QRal5Ueb3t2qeufIDkl6TAAAAAAAAAAHD5Dhm6FraoWtNw3xmsftfw43aav9gLsi5kDYD1ccr/gAAAApzdGFydF9nYW1lAAAAAAAFAAAAAy2DQRwAAAASAAAAAAAAAACO+drsns+C8ivJ7BbEvGPuuaf+RI7JYRYQh3tTDoG6yAAAABIAAAAAAAAAADzwlU9pvQCCZwaS876OkOohieXRjEidV8RoVpxgVhODAAAACgAAAAAAAAAAAAAAAAAPQkAAAAAKAAAAAAAAAAAAAAAAAA9CQAAAAAEAAAAAAAAAAQ711IO2j2xojpimQQ1dzE4A9Kskd2MeHXPKwLGFTKYYAAAACnN0YXJ0X2dhbWUAAAAAAAYAAAASAAAAAcPkOGboWtqha03DfGax+1/Djdpq/2AuyLmQNgPVxyv+AAAAAy2DQRwAAAASAAAAAAAAAACO+drsns+C8ivJ7BbEvGPuuaf+RI7JYRYQh3tTDoG6yAAAABIAAAAAAAAAADzwlU9pvQCCZwaS876OkOohieXRjEidV8RoVpxgVhODAAAACgAAAAAAAAAAAAAAAAAPQkAAAAAKAAAAAAAAAAAAAAAAAA9CQAAAAAA=";

    const { signedAuthEntry } = await StellarWalletsKit.signAuthEntry(xdr, {
      networkPassphrase: Networks.PUBLIC,
      address,
    });

    console.log("Signed Auth Entry:", signedAuthEntry);
  }

  render() {
    return (
      <>
        <h1>Vite + React</h1>
        <div className="card">
          <section>
            <div>
              <button onClick={() => this.authModal()}>
                Connect Wallet
              </button>

              <button onClick={() => this.disconnect()}>
                Disconnect
              </button>

              <button onClick={() => this.signTransaction()}>
                Sign transaction
              </button>

              <button onClick={() => this.signAuthEntry()}>
                Sign auth Entry
              </button>

              <button onClick={() => StellarWalletsKit.profileModal()}>
                Profile Modal
              </button>
            </div>

            <div>
              <p>
                Your selected wallet is: <br /> {this.state.moduleId}
              </p>
              <p>
                Your account is: <br /> {this.state.address &&
                  `${this.state.address.slice(0, 4)}....${
                    this.state.address.slice(-6)
                  }`}
              </p>

              <div style={{ marginBottom: "3rem" }}></div>

              <div>
                <p>
                  This is the built button, it follows the theme configured in
                  the kit but we are using the "free" mode of the button so it
                  uses our global React defined styles :
                </p>
                <div id="button"></div>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }
}

export default App;
