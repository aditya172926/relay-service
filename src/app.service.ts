import { CONTRACTS, postVaaSolana } from '@certusone/wormhole-sdk';
import { NodeWallet } from '@certusone/wormhole-sdk/lib/cjs/solana';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';

@Injectable()
export class AppService {

  constructor(
    @Inject('EVENT_SERVICE') private eventClient: ClientProxy
  ) {}

  async relayDataToSolana(payload: any) {

    console.log("Relay Data to Solana ", payload.vaa);

    try {
      const wormhole_contracts = CONTRACTS.DEVNET;
      const core_bridge_pid = new PublicKey(wormhole_contracts.solana.core);
      const connection = new Connection("https://api.devnet.solana.com");
      const secretKey = Uint8Array.from([]);
      const payer = Keypair.fromSecretKey(secretKey);
      const wallet = new NodeWallet(payer);
      const vaaBytes = Buffer.from(payload.vaa);

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
       * To add wormhole receive function in solana program
       * Then add the buying WIF logic in the receive function with conditions to the message received
       */

      const program = {};
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      console.log("blockhash ", blockhash);


      // implementing transaction and getting transaction id
      const transaction = new Transaction().add();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(wallet.publicKey);
      const signedTransaction = await wallet.signTransaction(transaction);
      const txSig = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log(txSig);

    } catch (error) {
      console.log("error", error);
    }

    // Sample simulation
    const sampleSolanaTxSig = "28uLLPGJ7wdRpDhdhJzh4S5SEcCdeCqh659TCDLnDQ1i6jPNtTX8HG9NRnxz5teSP7geeyox3BrcGCwkRPKDrXH9";
    const eventData = {
      sourceTransactionHash: payload.sourceTransactionHash,
      destinationTransactionHash: sampleSolanaTxSig
    }
    if (sampleSolanaTxSig)
      this.eventClient.emit('solana_txn_sig', eventData);
  }
}
