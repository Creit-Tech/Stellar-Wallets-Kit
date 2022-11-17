export declare const rabetGetPublicKey: () => Promise<{
    publicKey: string;
}>;
export declare const rabetSignTransaction: (params: {
    xdr: string;
    network: RabetNetwork;
}) => Promise<{
    xdr: string;
}>;
export declare enum RabetNetwork {
    PUBLIC = "mainnet",
    TESTNET = "testnet"
}
