import * as crypto from 'crypto';

// Transfer between two wallets
class Transaction {
  constructor(
    public amount: number, 
    public payer: string,
    public payee: string
  ) {}

  toString() {
    return JSON.stringify(this);
  }
}

class Block {

  public nonce = Math.round(Math.random() * 999999999);

  constructor(
    public prevHash: string, 
    public transaction: Transaction, 
    public ts = Date.now()
  ) {}

  get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash('SHA256');
    hash.update(str).end();
    return hash.digest('hex');
  }
}


// The blockchain
class Chain {
  // Singleton instance
  public static instance = new Chain();

  chain: Block[];

  constructor() {
    this.chain = [
      // Genesis block
      new Block('', new Transaction(100, 'genesis', 'satoshi'))
    ];
  }

 
  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Proof of work
  mine(nonce: number) {
    let solution = 1;
    console.log('⛏️⛏️⛏️  mining transaction.....')

    while(true) {
      const hash = crypto.createHash('MD5');
      hash.update((nonce + solution).toString()).end();
      const attempt = hash.digest('hex');
      if(attempt.substr(0,4) === '0000'){
        console.log("------------------------------------------------------")
        console.log(`---> Solved transaction avec la solution : ${solution}`);
        console.log("------------------------------------------------------")
        return solution;
      }
      solution += 1;
    }
  }

  // Add a new block to the chain if valid
  addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer) {
    console.log("🔴🟠🟢 Sending IZIHABCoin.....")
    
    const verify = crypto.createVerify('SHA256');
    verify.update(transaction.toString());

    const isValid = verify.verify(senderPublicKey, signature);

    if (isValid) {
      console.log("---> Transaction est valid ! ✅")
      const newBlock = new Block(this.lastBlock.hash, transaction);
      this.mine(newBlock.nonce);
      this.chain.push(newBlock);
    }
  }

}

// Wallet gives a user a public/private keypair
class Wallet {
  public publicKey: string;
  public privateKey: string;

  constructor() {
    const keypair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    this.privateKey = keypair.privateKey;
    this.publicKey = keypair.publicKey;
  }

  sendMoney(amount: number, payeePublicKey: string) {
    const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

    const sign = crypto.createSign('SHA256');
    sign.update(transaction.toString()).end();

    const signature = sign.sign(this.privateKey); 
    Chain.instance.addBlock(transaction, this.publicKey, signature);
  }
}

// Exemple d'utilisation
const MusicWontStop = new Wallet();
const loubna = new Wallet();
const anas = new Wallet();

MusicWontStop.sendMoney(50, loubna.publicKey);
loubna.sendMoney(23, anas.publicKey);
anas.sendMoney(5, MusicWontStop.publicKey);

console.log(Chain.instance)