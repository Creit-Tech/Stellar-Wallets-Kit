import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

/**
 * Fordefi Wallet module for Stellar Wallets Kit.
 *
 * The Fordefi browser extension can optionally impersonate the Freighter wallet
 * (controlled by a user-facing toggle in extension settings). When impersonation
 * is enabled, the extension listens for the standard Freighter postMessage
 * protocol (FREIGHTER_EXTERNAL_MSG_REQUEST / FREIGHTER_EXTERNAL_MSG_RESPONSE)
 * so that dapps using @stellar/freighter-api work transparently.
 *
 * This module reuses that same postMessage protocol to communicate with the
 * extension, while detecting Fordefi specifically via window.FordefiProviders
 * (which the extension always injects regardless of impersonation settings).
 * This allows the kit to show "Fordefi" as a distinct wallet option even when
 * Freighter impersonation is active.
 */

const FREIGHTER_EXTERNAL_MSG_REQUEST = "FREIGHTER_EXTERNAL_MSG_REQUEST";
const FREIGHTER_EXTERNAL_MSG_RESPONSE = "FREIGHTER_EXTERNAL_MSG_RESPONSE";

declare const window: Window &
	typeof globalThis & {
		isFordefi?: boolean;
		FordefiProviders?: {
			StellarProvider?: unknown;
		};
	};

let messageCounter = 0;

function sendFreighterMessage<T>(
	type: string,
	params?: Record<string, unknown>
): Promise<T> {
	return new Promise((resolve, reject) => {
		const messageId = ++messageCounter;

		const handler = (event: MessageEvent) => {
			if (event.source !== window) return;
			if (event.data?.source !== FREIGHTER_EXTERNAL_MSG_RESPONSE) return;
			// Freighter uses "messagedId" (typo with extra 'd') in responses
			if (event.data?.messagedId !== messageId) return;

			window.removeEventListener("message", handler);

			if (event.data.apiError) {
				reject(event.data.apiError);
			} else {
				resolve(event.data as T);
			}
		};

		window.addEventListener("message", handler);

		window.postMessage(
			{
				source: FREIGHTER_EXTERNAL_MSG_REQUEST,
				messageId,
				type,
				...params,
			},
			window.location.origin
		);
	});
}

export const FORDEFI_ID = "fordefi";

export class FordefiModule implements ModuleInterface {
	moduleType: ModuleType = ModuleType.HOT_WALLET;

	productId: string = FORDEFI_ID;
	productName: string = "Fordefi";
	productUrl: string = "https://www.fordefi.com";
	productIcon: string = "https://stellar.creit.tech/wallet-icons/fordefi.png";

	async runChecks(): Promise<void> {
		if (!(await this.isAvailable())) {
			throw new Error("Fordefi is not installed");
		}
	}

	async isAvailable(): Promise<boolean> {
		return (
			typeof window !== "undefined" &&
			!!window.FordefiProviders?.StellarProvider
		);
	}

	async getAddress(): Promise<{ address: string }> {
		try {
			await this.runChecks();

			const { publicKey } = await sendFreighterMessage<{ publicKey: string }>(
				"REQUEST_ACCESS"
			);

			if (!publicKey) {
				return Promise.reject({
					code: -3,
					message: "Failed to get address from Fordefi.",
				});
			}

			return { address: publicKey };
		} catch (e) {
			throw parseError(e);
		}
	}

	async signTransaction(
		xdr: string,
		opts?: {
			networkPassphrase?: string;
			address?: string;
			path?: string;
		}
	): Promise<{ signedTxXdr: string; signerAddress?: string }> {
		try {
			await this.runChecks();

			const { signedTransaction, signerAddress } = await sendFreighterMessage<{
				signedTransaction: string;
				signerAddress: string;
			}>("SUBMIT_TRANSACTION", {
				transactionXdr: xdr,
				networkPassphrase: opts?.networkPassphrase,
				accountToSign: opts?.address,
			});

			if (!signedTransaction) {
				return Promise.reject({
					code: -3,
					message: "Failed to sign transaction with Fordefi.",
				});
			}

			return { signedTxXdr: signedTransaction, signerAddress };
		} catch (e) {
			throw parseError(e);
		}
	}

	signAuthEntry(): Promise<{
		signedAuthEntry: string;
		signerAddress?: string;
	}> {
		return Promise.reject({
			code: -3,
			message: 'Fordefi does not support the "signAuthEntry" function',
		});
	}

	async signMessage(
		message: string,
		opts?: {
			networkPassphrase?: string;
			address?: string;
			path?: string;
		}
	): Promise<{ signedMessage: string; signerAddress?: string }> {
		try {
			await this.runChecks();

			const { signedBlob, signerAddress } = await sendFreighterMessage<{
				signedBlob: string | null;
				signerAddress: string;
			}>("SUBMIT_BLOB", {
				blob: message,
				networkPassphrase: opts?.networkPassphrase,
				accountToSign: opts?.address,
			});

			if (!signedBlob) {
				return Promise.reject({
					code: -3,
					message: "Failed to sign message with Fordefi.",
				});
			}

			return { signedMessage: signedBlob, signerAddress };
		} catch (e) {
			throw parseError(e);
		}
	}

	async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
		try {
			await this.runChecks();

			const { networkDetails } = await sendFreighterMessage<{
				networkDetails: { network: string; networkPassphrase: string };
			}>("REQUEST_NETWORK_DETAILS");

			return {
				network: networkDetails.network,
				networkPassphrase: networkDetails.networkPassphrase,
			};
		} catch (e) {
			throw parseError(e);
		}
	}
}
