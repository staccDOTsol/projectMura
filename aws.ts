import WebSocket, { Server } from 'ws';
import { createServer } from 'http';
import * as bs58 from 'bs58';

import { Token } from '@solana/spl-token'
import { OpenOrders } from '@project-serum/serum';
import * as borsh from 'borsh'
import { getOrCreateAssociatedTokenAccount } from './getorcreate';
import * as web3 from '@solana/web3.js'
import {
  closeAccount,
  initializeAccount,
  MSRM_DECIMALS,
  MSRM_MINT,
  SRM_DECIMALS,
  SRM_MINT,
  TOKEN_PROGRAM_ID,
  WRAPPED_SOL_MINT,
} from '@project-serum/serum/lib/token-instructions';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  AccountInfo,
  TransactionInstruction,
  AccountMeta,
  Transaction,
  Account, LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { DexInstructions } from '@project-serum/serum/lib/instructions';
import { Market } from './serum/src/market';
const poordev = true
const marketMaker = require("./market-maker");

const marketProxy = require("./market-proxy");

import * as anchor from "@project-serum/anchor";

const { OpenOrdersPda } = require("@project-serum/serum");

import fs from 'fs';
import {sendTransactionWithRetryWithKeypair } from './transactions'
import { getAtaForMint } from './accounts';
import { Connection } from '@solana/web3.js';
import { Key } from '@metaplex-foundation/mpl-token-metadata';
import { ErrorCode } from '@strata-foundation/spl-token-collective';
let SERUM_DEX = new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin")
const v8 = require('v8');

interface WorthlessEntry {
  prices: number[];
  market_ids: string[];
  tokens: string[];
  volumes: number[];
  profit_potential: number;
  decimals : number[];
  token_ids : string[];
  trades: ("BID" | "ASK")[]; // BUY | SELL
}

 async function sendTransaction(
  connection: any,
  transaction: Transaction,
  signers: Array<Keypair>,
): Promise<any> {
  let ns: Keypair[] = []
  for (var signer of signers){
if (signer.publicKey){
  
    console.log(signer.publicKey.toBase58())
 // @ts-ignore
    ns.push(signer)
}
  }
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash('confirmed')
  ).blockhash;
  try {
    const signature = await provider.send(transaction, ns)
  
  /*
  const { value } = await connection.confirmTransaction(
    signature,
    'recent',
  );
  if (value?.err) {
    throw new Error(JSON.stringify(value.err));
  }  */

  return signature;

}catch(err){
  return err
}
}

const server = createServer();
const wss = new Server({ noServer: true });
export function loadWalletKey(keypair: string): Keypair {
  if (!keypair || keypair == '') {
    throw new Error('Keypair is required!');
  }
  const loaded = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())),
  );
  console.info(`wallet public key: ${loaded.publicKey}`);
  return loaded;
}
let wallet =  (loadWalletKey('/Users/jarettdunn/.config/solana/id.json'))
let pubkey = wallet.publicKey

//let connection = new web3.Connection("https://solana-api.projectserum.com")//https://rpc.theindex.io/mainnet-beta/4ae962ec-5c8c-4071-9ef2-e5c6b59bdf3e")/
let connection = new web3.Connection("https://dark-floral-field.solana-mainnet.quiknode.pro/a6ef9fd10f3f1521e58fc55d420002e11cf6c167/")

// @ts-ignore
const walletWrapper = new anchor.Wallet(wallet);
// @ts-ignore
const provider = new anchor.Provider(connection, walletWrapper, {
  skipPreflight: true
});


async function doTrade(trade: any){

  try {
  console.log(trade.profit_potential)
  if (trade.profit_potential > 1.01){
    trade.profit_potential = trade.profit_potential - 0.01
 let market_ids = trade.market_ids
 let trades = trade.trades 
 let prices = trade.prices 
 let volumes = trade.volumes
 // @ts-ignore
   let insts = []
   let payer 

const transaction = new  Transaction();
const signers: Keypair[] = [];

let account;
  
account = new Keypair();

let openOrdersAddress = account.publicKey;
// @ts-ignore
let newinsts = []

transaction.recentBlockhash = (
  await connection.getLatestBlockhash('recent')
).blockhash;
let insts2: any = []


const tx = new Transaction()
let signers2: any = []
let  marketMakerAccounts
let side
let market
let openOrdersAccounts
let openOrders
  for (var which in market_ids){
    try{
    if (true){//parseInt(which) <= 1){
   market = await Market.load(connection, new PublicKey(market_ids[which]), {skipPreflight: true,commitment:'recent'}, SERUM_DEX);
   const ownerAddress: PublicKey = wallet.publicKey
    openOrdersAccounts = await market.findOpenOrdersAccountsForOwner(
     connection,
     ownerAddress,
     0,
   );
   console.log(openOrdersAccounts.length)
    try{

   openOrdersAddress = openOrdersAccounts[0].address
   openOrders = openOrdersAccounts[0]
    account = await connection.getAccountInfo( openOrdersAddress)//, 'recent', SERUM_DEX)
    }
    catch(err){

      console.log(err)
      
     let account;
   
     const tx: Transaction = new Transaction();
    
       account = new Keypair();
     tx.add(
       await OpenOrders.makeCreateAccountTransaction(
         connection,
         market.address,
         ownerAddress,
         account.publicKey,
         market._programId,  
       ),
     );
     openOrdersAddress = account.publicKey;
   //  signers.push(account);
     const signature = await connection.sendTransaction(tx, [wallet, account], {
       skipPreflight: true,
       
     });
     await connection.confirmTransaction(signature,'single')
     console.log(signature)
     
     console.log(signature)
     console.log(signature)
     console.log(signature)
     console.log(signature)
     console.log(signature)
   
     openOrdersAddress = account.publicKey
     openOrders = account
     // refresh the cache of open order accounts on next fetch
    // market._openOrdersAccountsCache[ownerAddress.toBase58()].ts = 0;
   } 
   var bT =await getAtaForMint(
    market.baseMintAddress,
      wallet.publicKey
      )[0]
      var qT = await getAtaForMint(
       market.quoteMintAddress,
         wallet.publicKey
         )[0]
         
   marketMakerAccounts = {
    account: wallet,
    owner:wallet,
    baseToken: bT ,//new PublicKey("So11111111111111111111111111111111111111112"),//fundedAccount.tokens[mintGodA.mint.toString()],
    quoteToken: qT ,//new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")//fundedAccount.tokens[mintGodB.mint.toString()],
  baseMint:market.baseMintAddress,
  quoteMint:market.quoteMintAddress
   }
try {

  console.log(marketMakerAccounts.baseToken.toBase58())
  console.log(marketMakerAccounts.quoteToken.toBase58())
  
  }
  catch(err) { 
     var bT = (await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.publicKey,
   market.baseMintAddress,
   // @ts-ignore
     provider.wallet,
     wallet.publicKey,
     true,
     )
     )
     var qT = (await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.publicKey,
   market.quoteMintAddress,
   // @ts-ignore
     provider.wallet,
     wallet.publicKey,
     true,
     )
     )
   marketMakerAccounts = {
    account: wallet,
    owner:wallet,
    baseToken: bT ,//new PublicKey("So11111111111111111111111111111111111111112"),//fundedAccount.tokens[mintGodA.mint.toString()],
    quoteToken: qT ,//new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")//fundedAccount.tokens[mintGodB.mint.toString()],
  baseMint:market.baseMintAddress,
  quoteMint:market.quoteMintAddress
  };
  try {
  console.log(marketMakerAccounts.baseToken.toBase58())
  console.log(marketMakerAccounts.quoteToken.toBase58())
  
  }
  catch(err) { 
    var bT =await getAtaForMint(
   market.baseMintAddress,
     wallet.publicKey
     )[0]
     var qT = await getAtaForMint(
      market.quoteMintAddress,
        wallet.publicKey
        )[0]
   marketMakerAccounts = {
    account: wallet,
    owner:wallet,
    baseToken: bT ,//new PublicKey("So11111111111111111111111111111111111111112"),//fundedAccount.tokens[mintGodA.mint.toString()],
    quoteToken: qT ,//new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")//fundedAccount.tokens[mintGodB.mint.toString()],
  baseMint:market.baseMintAddress,
  quoteMint:market.quoteMintAddress
  };
  }
}
  transaction.feePayer=marketMakerAccounts.baseToken
// @ts-ignore

  const marketProxyClient = await marketProxy.load(
    connection,
    new PublicKey("J2NhFnBxcwbxovE7avBQCXWPgfVtxi5sJfz68AH6R2Mg"),
    SERUM_DEX,
    new PublicKey(market_ids[which])
  );


var openOrdersAddressKey: PublicKey = await OpenOrdersPda.openOrdersAddress(
  marketProxyClient.market.address,
  marketMakerAccounts.account.publicKey,
  marketProxyClient.dexProgramId,
  marketProxyClient.proxyProgramId
);
var openOrdersAddressKey = new PublicKey("DW9kzAmYEMpfeZEbMpoTkHnnFz81RToapmApwMtULJZ4")
//openOrdersAddressKey = account.publicKey
  // Fetching orderbooks
  /*
let bids = await market.loadBids(connection);
let asks = await market.loadAsks(connection);
// L2 orderbook data

let price = 0
let size = 0
for (let [price2, size2] of bids.getL2(1)) {
  price = price2 
  size = size2
  console.log(price, size);
}
 let side = trades[which] == 'BID' ? 'sell' : 'buy'
 if (side == 'buy'){
for (let [price2, size2] of asks.getL2(1)) {
  price = price2 
  size = size2
  console.log(price, size);
}
*/
 side = trades[which] == 'BID' ? 'sell' : 'buy'

var size = volumes[which] /// 13.8 / 3
//size = 1
var price = prices[which]
console.log([size, price])
//size = 1
 
 let maxT = 5000
 let cacheDurationMs = maxT
let orderType = 'ioc'
let feeDiscountPubkey = undefined
let clientId = undefined 
let owner = wallet
payer = side == 'buy' ? marketMakerAccounts.quoteToken : marketMakerAccounts.baseToken
let selfTradeBehavior = 'decrementTake'
let ou = await market.placeOrder( connection, // @ts-ignore
{stuff:[{side, price, size}],   owner, payer, orderType, openOrdersAddressKey,   bW: marketMakerAccounts.baseToken, qW:
marketMakerAccounts.quoteToken })
  console.log(ou.insts.length)
 tx.add(...ou.insts)
for (var s of ou.signers){
  if (!signers2.includes(s)){
    signers2.push(s)
  }
}
    }
  }catch(err){
    console.log(err)
  }
}
console.log('....woot')
let bW = marketMakerAccounts.baseToken
let qW = marketMakerAccounts.quoteToken
const ownerAddress: PublicKey = wallet.publicKey

const vaultSigner = await PublicKey.createProgramAddress(
  [
    market.address.toBuffer(),
    market._decoded.vaultSignerNonce.toArrayLike(Buffer, 'le', 8),
  ],
  market._programId,
);
let wrappedSolAccount: Keypair | null = null;
if (
  (market.baseMintAddress.equals(WRAPPED_SOL_MINT) &&
    bW.equals(openOrders.owner)) ||
  (market.quoteMintAddress.equals(WRAPPED_SOL_MINT) &&
    qW.equals(openOrders.owner))
) {
  wrappedSolAccount = new Keypair();
  insts2.push(
    SystemProgram.createAccount({
      fromPubkey: openOrders.owner,
      newAccountPubkey: wrappedSolAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(165),
      space: 165,
      // @ts-ignore
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  insts2.push(
    initializeAccount({
      account: wrappedSolAccount.publicKey,
      mint: WRAPPED_SOL_MINT,
      owner: openOrders.owner,
    }),
  );
  if (!signers2.includes(wrappedSolAccount ))
  signers2.push(wrappedSolAccount);
}
if (tx.instructions.length > 0){
insts2.push(
  DexInstructions.settleFunds({
    market: market.address,
    openOrders: openOrders.address,
    owner: openOrders.owner,
    baseVault: market._decoded.baseVault,
    quoteVault: market._decoded.quoteVault,
    baseWallet:
      side == 'buy'
        ? qW
        : bW,
    quoteWallet:
      side == 'sell'
        ? qW
        : bW,
    vaultSigner,
    programId: market._programId,
    referrerQuoteWallet: null,
  }),
);
}
const data = Buffer.from(
  Uint8Array.of(0, ...new anchor.BN(256000).toArray("le", 4))
);
const additionalComputeBudgetInstruction = new TransactionInstruction({
  keys: [],
  programId: new PublicKey("ComputeBudget111111111111111111111111111111"),
  data,
});
if (insts2.length > 0){
  tx.add(additionalComputeBudgetInstruction)
tx.add(...insts2)
}
console.log(tx.instructions.length)
console.log(tx.instructions.length)
console.log(tx.instructions.length)
console.log(tx.instructions.length)
console.log(tx.instructions.length)
console.log(tx.instructions.length)
console.log(tx.instructions.length)
console.log(tx.instructions.length)
var thething 
var theh = new PublicKey("AWodPqZJNp6i6MbFLiGBhhWCizGc5RWrxHnUxWr85g6s")
side == 'sell' ? thething = marketMakerAccounts.quoteMint : marketMakerAccounts.baseMint
    var thet = await getAtaForMint(
      thething,
      theh
       )[0]
      
try {

console.log(thet.toBase58())

}
catch(err) { 
  
   var thet = (await getOrCreateAssociatedTokenAccount(
    connection,
    wallet.publicKey,
 thething,
 // @ts-ignore
   provider.wallet,
   theh,
   true,
   )
   )
 
try {
console.log(thet.toBase58())

}
catch(err) { 
  var thet = await getAtaForMint(
    thething,
    theh
     )[0]

}
}
tx.add(Token.createTransferInstruction(
  TOKEN_PROGRAM_ID,
  side == 'sell' ? marketMakerAccounts.quoteToken : marketMakerAccounts.baseToken,
  thet,
  wallet.publicKey,
  [],
  new anchor.BN(Math.floor(size * (trade.profit_potential - 1) * (10 ** (side == 'sell' ? market.quoteMintDecimals : market.baseMintDecimals))))
));
console.log(market.quoteMintDecimals)
console.log(market.quoteMintDecimals)
console.log(market.quoteMintDecimals)
console.log(market.quoteMintDecimals)
console.log(market.quoteMintDecimals)

return {connection, tx, signers2}
/*
// @ts-ignore
const ownerAddress: PublicKey = owner.publicKey ?? owner;
let openOrdersAccounts = await market.findOpenOrdersAccountsForOwner(
  connection,
  ownerAddress
);
// @ts-ignore
//openOrdersAccounts = [account]
console.log(openOrdersAccounts)
// Fetch an SRM fee discount key if the market supports discounts and it is not supplied
let useFeeDiscountPubkey: PublicKey | null;
if (feeDiscountPubkey) {
  useFeeDiscountPubkey = feeDiscountPubkey;
} else if (
  feeDiscountPubkey === undefined &&
  market.supportsSrmFeeDiscounts
) {
  useFeeDiscountPubkey = (
    await market.findBestFeeDiscountKey(
      connection,
      ownerAddress,
      5000,
    )
  ).pubkey;
} else {
  useFeeDiscountPubkey = null;
}

if (openOrdersAccounts.length === 0) {

  // refresh the cache of open order accounts on next fetch
}  else if (openOrdersAddressKey) {
  openOrdersAddress = openOrdersAddressKey;
} else {
  openOrdersAddress = openOrdersAccounts[0].address;
}

let wrappedSolAccount: Keypair | null = null;
if (payer.equals(ownerAddress)) {
  if (
    (side === 'buy' && market.quoteMintAddress.equals(WRAPPED_SOL_MINT)) ||
    (side === 'sell' && market.baseMintAddress.equals(WRAPPED_SOL_MINT))
  ) {
    wrappedSolAccount = new Keypair();
    let lamports;
    if (side === 'buy') {
      lamports = Math.round(price * size * 1.01 * LAMPORTS_PER_SOL);
      if (openOrdersAccounts.length > 0) {
        lamports -= openOrdersAccounts[0].quoteTokenFree.toNumber();
      }
    } else {
      lamports = Math.round(size * LAMPORTS_PER_SOL);
      if (openOrdersAccounts.length > 0) {
        lamports -= openOrdersAccounts[0].baseTokenFree.toNumber();
      }
    }
    lamports = Math.max(lamports, 0) + 1e7;
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: ownerAddress,
        newAccountPubkey: wrappedSolAccount.publicKey,
        lamports,
        space: 165,
        programId: TOKEN_PROGRAM_ID,
      }),
    );
    transaction.add(
      initializeAccount({
        account: wrappedSolAccount.publicKey,
        mint: WRAPPED_SOL_MINT,
        owner: ownerAddress,
      }),
    );  
    if (!signers.includes(wrappedSolAccount)){
    signers.push(wrappedSolAccount);
    }
  } else {
    throw new Error('Invalid payer account');
  }
}

const placeOrderInstruction = market.makePlaceOrderInstruction(connection, {
  owner,
  payer: wrappedSolAccount?.publicKey ?? payer,
  // @ts-ignore
  side,
  price,
  size, // @ts-ignore
  orderType,
  clientId,
  openOrdersAddressKey: openOrdersAddress,
  feeDiscountPubkey: useFeeDiscountPubkey, // @ts-ignore
  selfTradeBehavior,
  maxTs: 5000
});
transaction.add(placeOrderInstruction);
    if (parseInt(which) == 0){
    openOrdersAddress = account.publicKey;
   
   //console.(transaction.instructions.length)
   console.log(transaction)
   // @ts-ignore
   let wow = await provider.send(transaction, [...signers, wallet])// sendTransactionWithRetryWithKeypair(connection, wallet, transaction, signers)
    }
    */
   //console.(transaction.instructions.length)
  // }
   /*
    market.placeOrder(
    connection,
    {
      owner: wallet,
      payer,
      side,
      price,
      size,
      price2,
      size2,
      orderType = 'ioc',
      clientId,
      openOrdersAddressKey,
      openOrdersAccount,
      feeDiscountPubkey,
    }
 } */

}
else {
  console.log('awww')
}
  }
  catch(err){
    console.log(err)
  }
}
//let data = [{"prices":[0.27851702250432776,3.482,0.29,0.8163265306122448,1.254],"market_ids":["HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1","HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1","HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1","8afKwzHR3wJE7W7Y5hvQkngXh6iTepSZuutRMMy96MjR","8afKwzHR3wJE7W7Y5hvQkngXh6iTepSZuutRMMy96MjR"],"tokens":["USDT","SUSHI","USDC","USDT","SXP","USDT"],"volumes":[10,10,10,842.2,5161.8],"profit_potential":1.0578279642742414,"trades":["BID","ASK","BID","ASK","ASK","BID"]}]//,{"prices":[0.8163265306122448,1.254,0.28851702250432776,3.582,0.9999000099990001],"market_ids":["8afKwzHR3wJE7W7Y5hvQkngXh6iTepSZuutRMMy96MjR","8afKwzHR3wJE7W7Y5hvQkngXh6iTepSZuutRMMy96MjR","6DgQRTpJTnAYBSShngAVZZDq7j9ogRN1GfSQ3cq9tubW","A1Q9iJDVVS8Wsswr9ajeZugmj64bQVCYLZQLra2TMBMo","77quYg4MGneUdjgXCunt9GgM1usmrxKY31twEy3WHwcS"],"tokens":["USDT","SXP","USDT","SUSHI","USDC","USDT"],"volumes":[842.2,5161.8,0.19,0.46,56740],"profit_potential":1.0578279642742412,"trades":["ASK","BID","ASK","BID","ASK"]}]
var data =      JSON.parse(Buffer.from( bs58.decode(fs.readFileSync('./decoded1.json').toString()) ).toString())
console.log(data)
//for (var trade of data){
    // @ts-ignore
    if (poordev){
    for (var abc = 0; abc <= 1; abc++){
      let min = 100000000000
      let w = 0
      let ww = 0
      let div = 0
for (var v of data[abc].volumes){
if (v < min){
min = v
ww = w
div = 1 / min
}
w++
}
let c = 0
for (var v of data[abc].volumes){
data[abc].volumes[c] = v * div
c++
}
      }
    }
      console.log(data)
    setTimeout(async function(){
        try {
         
  let hm2 = await   doTrade(data[1])
// @ts-ignore
  let ahh2 =  await sendTransaction(hm2.connection, hm2.tx, [
    wallet,
     // @ts-ignore
    ...hm2.signers2,
   ]
   );
       console.log(ahh2)
  }
      catch(err){
        console.log(err)
      }         }, 1)
      setTimeout(async function(){

      try {
   let hm = await   doTrade(data[0])
  // @ts-ignore
        
  let ahh =  await sendTransaction(hm.connection, hm.tx, [
    wallet,
     // @ts-ignore
    ...hm.signers2,
   ]
   );
       console.log(ahh)
       //let connection = new web3.Connection("https://rpc.theindex.io/mainnet-beta/4ae962ec-5c8c-4071-9ef2-e5c6b59bdf3e")

       }

 catch(err)
 {
   console.log(err)
 }
  },1)
    
//}
// @ts-ignore
wss.on('connection', function connection(ws:any) {
  ws.on('message', function message(data: any) {
   try {
    fs.writeFileSync('./decoded1.json', data)

     data =      JSON.parse(Buffer.from( bs58.decode(data) ).toString())

   }
   catch (err){
     console.log(err)
   }
   //console.(data);
   try {

    data =      JSON.parse(Buffer.from( bs58.decode(data.toString()) ).toString())

   }
   catch(err){
     console.log(err)
   }
   console.log(data)
   if (poordev){
   for (var abc = 0; abc <= 1; abc++){
    let min = 100000000000
    let w = 0
    let ww = 0
    let div = 0
for (var v of data[abc].volumes){
if (v < min){
min = v
ww = w
div = 1 / min
}
w++
}
let c = 0
for (var v of data[abc].volumes){
data[abc].volumes[c] = v * div
c++
}
    }
  }
    console.log(data)
  // for (var trade of data){
    setTimeout(async function(){
      try {

        let hm2 = await   doTrade(data[1])
// @ts-ignore
let ahh2 = await  sendTransaction(hm2.connection, hm2.tx, [
  wallet,
   // @ts-ignore
  ...hm2.signers2,
 ]
 );
     console.log(ahh2)
}
    catch(err){
      console.log(err)
    }         }, 1)
    setTimeout(async function(){

    try {
 let hm = await   doTrade(data[0])
// @ts-ignore
      
let ahh =  await sendTransaction(hm.connection, hm.tx, [
  wallet,
   // @ts-ignore
  ...hm.signers2,
 ]
 );
     console.log(ahh)
     //let connection = new web3.Connection("https://rpc.theindex.io/mainnet-beta/4ae962ec-5c8c-4071-9ef2-e5c6b59bdf3e")

     }

catch(err)
{
 console.log(err)
}
},1)
 //  }
//fs.writeFileSync('./decoded.json', data)
  });
});
// @ts-ignore
server.on('upgrade', function upgrade(request:any, socket:any, head:any) {

    wss.handleUpgrade(request, socket, head, function done(ws:any) {
      wss.emit('connection', ws, request);
    });
});

server.listen(8081);