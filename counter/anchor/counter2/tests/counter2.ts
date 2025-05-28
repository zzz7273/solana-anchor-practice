import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter2 } from "../target/types/counter2";
import { BN } from "bn.js";

import { expect } from "chai";
import { airdropIfRequired } from "@solana-developers/helpers";

describe("counter2++++++++++++", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  
  anchor.setProvider(provider);

  // 直接使用test框架默认的钱包，可能有一些默认行为不受控制。后面交易时还是指定钱包来签名吧

  const keypair1 = anchor.web3.Keypair.generate();
  console.log("wallet1 address:", keypair1.publicKey.toBase58());

  const keypair2 = anchor.web3.Keypair.generate();
  console.log("wallet2 address:", keypair2.publicKey.toBase58());



  const program = anchor.workspace.counter2 as Program<Counter2>;

  const defineCounterByWallet1 = (name:string, maxVal: number, onlyOwner:boolean) => {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(name), keypair1.publicKey.toBuffer()],
      program.programId,
    );

    const counter = {
      counterName: name,
      maxValue: new BN(maxVal),
      onlyOwner: onlyOwner,
      pda: pda.toBase58(),
      bump: bump,
    }
    console.log("defineCounter:", counter);
    return counter;
  }

  const c1 = defineCounterByWallet1("1号计数器abc",10, true);

  it("Is create counter!", async () => {
    // Add your test here.
    console.log("\n\n");

    await airdropIfRequired(anchor.getProvider().connection, keypair1.publicKey, 2_000_000_000, 1_000_000_000);
    await airdropIfRequired(anchor.getProvider().connection, keypair1.publicKey, 2_000_000_000, 1_000_000_000);
    
    // pda 通过 keypair1 派生
    const tx = await program.methods.createCounter(c1.maxValue, c1.counterName, c1.onlyOwner)
      .accountsPartial({counter:c1.pda,  owner: keypair1.publicKey})
      .signers([keypair1])
      .rpc();

    // console.log("create counter c1 signature", tx);

    const cc = await program.account.counterInfo.fetch(c1.pda);

    console.log(`counter[${c1.pda}] chain info: `, cc);

    expect(cc.count.toNumber()).to.equal(0);
    expect(cc.maxValue.toNumber()).to.equal(c1.maxValue.toNumber());
    expect(cc.onlyOwner).to.equal(true);
  });

  it("Is increament for owner!", async () => {
    
    // https://solana.stackexchange.com/questions/16070/typescript-type-error-with-multiple-accounts-in-program-struct
    // https://github.com/solana-foundation/anchor/pull/2824    搜索"accountsPartial"
    // accounts: This method is now fully type-safe based on the resolution fields in the IDL, making it much easier to only specify the accounts that are actually needed.
    // accountsPartial: This method keeps the old behavior and let's you specify all accounts including the resolvable ones.
    // accountsStrict: If you don't want to use account resolution and specify all accounts manually (unchanged).
    
    // Add your test here.

    console.log("\n\n");

    const tx = await program.methods
      .increment(c1.counterName)
      .accountsPartial({counter: c1.pda,owner: keypair1.publicKey, user: keypair1.publicKey})
      .signers([keypair1])
      .rpc();

    // console.log("create counter c2 signature", tx);

    const cc = await program.account.counterInfo.fetch(c1.pda);

    console.log(`counter[${c1.pda}] chain info: `, cc);

  });

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  it("Is increament for others should be failed!", async () => {
    console.log("\n\n");
    try {

      const tx = await program.methods
        .increment(c1.counterName)
        .accountsPartial({counter: c1.pda, owner: keypair1.publicKey, user: keypair2.publicKey})
        .signers([keypair2]) 
        .rpc();


      // console.log("create counter c2 signature", tx);

      const cc = await program.account.counterInfo.fetch(c1.pda);

      console.log(`counter[${c1.pda}] chain info: `, cc);

      // 如果没有抛出错误，这里强制让测试失败
      chai.assert(false, "increament for others should have failed but it didn't.");
    } catch (err) {
        // 检查错误类型
        expect(err).to.be.instanceOf(anchor.AnchorError);
        // 检查错误码（假设自定义错误码为6000）
        expect((err as anchor.AnchorError).error.errorMessage).to.equal("Only Owner");
        // 也可以断言错误信息
        // expect((err as AnchorError).error.errorMessage).to.equal("your error message");
        console.log("increment for others failed as expected:", (""+err).split("\n")[0]+" ...");
    }


  });


  it("Is increament for others should be success!", async () => {
    console.log("\n\n");

    const tx1 = await program.methods
      .setOnlyOwner(c1.counterName, false)
      .accountsPartial({counter: c1.pda, owner: keypair1.publicKey})
      .signers([keypair1]) 
      .rpc();
    
    const cc0 = await program.account.counterInfo.fetch(c1.pda);
    console.log(`counter00[${c1.pda}] chain info: `, cc0);

    const tx2 = await program.methods
      .increment(c1.counterName)
      .accountsPartial({counter: c1.pda, owner: keypair1.publicKey, user: keypair2.publicKey})
      .signers([keypair2]) 
      .rpc();


    // console.log("create counter c2 signature", tx);

    const cc = await program.account.counterInfo.fetch(c1.pda);

    console.log(`counter[${c1.pda}] chain info: `, cc);

  });

});
