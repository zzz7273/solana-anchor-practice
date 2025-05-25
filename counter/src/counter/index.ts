import CounterIDL from "../../anchor/counter/target/idl/counter.json";
import type { Counter } from "../../anchor/counter/target/types/counter";

// import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, Idl, AnchorProvider, setProvider } from "@coral-xyz/anchor";

import * as web3 from "@solana/web3.js";
import "dotenv/config";
import {
  getKeypairFromEnvironment,
  airdropIfRequired,
} from "@solana-developers/helpers";

// 下面直接用cjs/nodewallet，会报NodeWallet is not a constructor。
// 因此从github上取一个master版本的代码放到 base 目录里，然后引入使用。
// import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import NodeWallet from "../base/nodewallet";
import { count } from "console";
import { setMaxIdleHTTPParsers } from "http";

// web3.Keypair.generate(); //
const payer =  getKeypairFromEnvironment("SECRET_KEY");
console.log("payer address:", payer.publicKey.toBase58());

const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

const wallet = new NodeWallet(payer);
const provider = new AnchorProvider(connection, wallet, {});
setProvider(provider);

// we can also explicitly mention the provider
const program = new Program(CounterIDL as Counter, provider);

const counter = web3.Keypair.generate(); 
console.log("counter address:", counter.publicKey.toBase58());

// const signature = await program.methods.initialize().accounts({
//   counter:counter.publicKey,
//   // user: payer.publicKey,
//   // system_program: web3.SystemProgram.programId,
//   }).signers([counter]).rpc();

// console.log("✅Transaction is completed! signature:", signature);
 

const tx = await program.methods.initialize().accounts({
  counter:counter.publicKey,
  // user: payer.publicKey,
  // system_program: web3.SystemProgram.programId,
  }).signers([counter]).transaction();

const signature = await connection.sendTransaction(tx, [payer,counter]);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

await sleep(20000); // 
const account = await program.account.counter.fetch(counter.publicKey);
const accounts = await program.account.counter.fetchMultiple([
  counter.publicKey,
]);

console.log("counter account:", account);
console.log("counter account2:", accounts);

