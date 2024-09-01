import { CONTRACTS, postVaaSolana } from '@certusone/wormhole-sdk';
import { NodeWallet } from '@certusone/wormhole-sdk/lib/cjs/solana';
import { Injectable } from '@nestjs/common';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';

@Injectable()
export class AppService {

  async relayDataToSolana(vaa: string) {

    console.log("Relay Data to Solana ", vaa);

    try {
      const wormhole_contracts = CONTRACTS.DEVNET;
      const core_bridge_pid = new PublicKey(wormhole_contracts.solana.core);
      const connection = new Connection("https://api.devnet.solana.com");
      const secretKey = Uint8Array.from([]);
      const payer = Keypair.fromSecretKey(secretKey);
      const wallet = new NodeWallet(payer);
      const vaaBytes = Buffer.from(vaa);

      try {
        await postVaaSolana(
          connection,
          wallet.signTransaction,
          core_bridge_pid,
          wallet.publicKey,
          vaaBytes
        );
      } catch (error: any) {
        throw new Error(error);
      }

      /**
       * Rest of the code can be taken from Wormhole docs
       */

      const program = {};
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      console.log("blockhash ", blockhash);


      // implementing transaction and getting transaction id
      const transaction = new Transaction().add();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(wallet.publicKey);
      const signedTransaction = await wallet.signTransaction(transaction);
      // const txid = await connection.sendRawTransaction(signedTransaction);

    } catch (error) {
      console.log("error", error);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
