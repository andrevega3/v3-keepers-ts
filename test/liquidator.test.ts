// liquidator.test.ts
import {
    ParclV3Sdk,
    getExchangePda,
    translateAddress,
} from "@parcl-oss/v3-sdk"
import {
    Connection,
    Keypair,
    PublicKey,
    Commitment,
} from "@solana/web3.js";
import now from  'performance-now';
import bs58 from "bs58";
import { runLiquidator } from "../src/bin/liquidator";
import * as dotenv from "dotenv";
dotenv.config();

// let exchangeAddress: PublicKey;

describe('ParclV3 Liquidator Test', () => {
    let exchangeAddress: PublicKey;
    let liquidatorMarginAccount: PublicKey;
    let liquidatorSigner: Keypair;
    let interval: number;
    let commitment: Commitment | undefined;
    let sdk: ParclV3Sdk;
    let connection: Connection;

    beforeAll(() => {
        console.log("Initializing liquidator variables");
        if (process.env.RPC_URL === undefined) {
          throw new Error("Missing rpc url");
        }
        if (process.env.LIQUIDATOR_MARGIN_ACCOUNT === undefined) {
          throw new Error("Missing liquidator margin account");
        }
        if (process.env.PRIVATE_KEY === undefined) {
          throw new Error("Missing liquidator signer");
        }
        [exchangeAddress] = getExchangePda(0);
        liquidatorMarginAccount = translateAddress(process.env.LIQUIDATOR_MARGIN_ACCOUNT);
        liquidatorSigner = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));
        interval = parseInt(process.env.INTERVAL ?? "300");
        commitment = process.env.COMMITMENT as Commitment | undefined;
        sdk = new ParclV3Sdk({rpcUrl: process.env.RPC_URL, commitment});
        connection = new Connection(process.env.RPC_URL, commitment);
    })

    it('should liquidate any accounts that are liquidatable', async () => {
        const startTime = now();
        await runLiquidator({
            sdk,
            connection,
            interval,
            exchangeAddress,
            liquidatorSigner,
            liquidatorMarginAccount,
        });
        const endTime = now();
        const duration = endTime - startTime;
        console.log(`liquidation process took ${duration}ms`);
    });
});
