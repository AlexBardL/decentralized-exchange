// Contracts
const Token = artifacts.require("Token")
const Exchange = artifacts.require("Exchange")

// Helpers
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

const ether = (n) => {
   return new web3.utils.BN(
      web3.utils.toWei(n.toString(), 'ether')
   )
}

const tokens = (n) => ether(n)

const wait = (seconds) => {
   const milliseconds = seconds * 1000
   return new Promise(resolve => setTimeout(resolve, milliseconds))
 }


module.exports = async callback => {
   try {
      // Fetch accounts from wallet
      const accounts = await web3.eth.getAccounts()

      // Fetch the deployed token
      const token = await Token.deployed()
      console.log('Token fetched', token.address)
      
      // Fetch the deployed exchange
      const exchange = await Exchange.deployed()
      console.log('Exchange fetched', exchange.address)

      // Give tokens to account[1]
      const sender = accounts[0]
      const receiver = accounts[1]
      let amount = web3.utils.toWei('10000', 'ether')    // 10,000 tokens

      await token.transfer(receiver, amount, { from: sender })
      console.log(`Transferred ${web3.utils.fromWei(amount.toString(), 'ether')} tokens from ${sender} to ${receiver}`)

      // Set up exchange users
      const user1 = accounts[0]
      const user2 = accounts[1]

      // User1 deposits Ether
      amount = 2
      await exchange.depositEther({ from: user1, value: ether(amount) })
      console.log(`Deposited ${amount} Ether from ${user1}`)
      // User1 approves tokens
      amount = 10000
      await token.approve(exchange.address, tokens(amount), { from: user1 })
      console.log(`Approved ${amount} tokens from ${user1}`)
      // User1 deposits tokens
      await exchange.depositToken(token.address, tokens(amount), { from: user1 })
      console.log(`Deposited ${amount} tokens from ${user1}`)

      // User2 deposits Ether
      amount = 2
      await exchange.depositEther({ from: user2, value: ether(amount) })
      console.log(`Deposited ${amount} Ether from ${user2}`)
      // User2 approves tokens
      amount = 10000
      await token.approve(exchange.address, tokens(amount), { from: user2 })
      console.log(`Approved ${amount} tokens from ${user2}`)
      // User2 deposits tokens
      await exchange.depositToken(token.address, tokens(amount), { from: user2 })
      console.log(`Deposited ${amount} tokens from ${user2}`)
      // --------------------------------------------------------------------------
      
      // ---------------------- Seed a Cancelled Order ----------------------------

      // User1 makes order to get tokens
      let result
      let orderId
      result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1 })
      console.log(`Made order from ${user1}`)

      // User1 cancels order
      orderId = result.logs[0].args.id
      await exchange.cancelOrder(orderId, { from: user1 })
      console.log(`Cancelled order from ${user1}`)
      // --------------------------------------------------------------------------

      // -------------------------- Seed Filled Orders ----------------------------

      // User 1 makes order
      result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.2), { from: user1 })
      console.log(`Made order from ${user1}`)

      // User 2 fills order
      orderId = result.logs[0].args.id
      await exchange.fillOrder(orderId, { from: user2 })
      console.log(`Filled order from ${user1}`)

      await wait(1)

      // User 1 makes another order
      result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.125), token.address, tokens(25), { from: user1 })
      console.log(`Made another order from ${user1}`)

      // User 2 fills another order
      orderId = result.logs[0].args.id
      await exchange.fillOrder(orderId, { from: user2 })
      console.log(`Filled another order from ${user1}`)

      await wait(1)

      // User 1 makes final order
      result = await exchange.makeOrder(token.address, tokens(30), ETHER_ADDRESS, ether(0.3), { from: user1 })
      console.log(`Made final order from ${user1}`)

      // User 2 fills final order
      orderId = result.logs[0].args.id
      await exchange.fillOrder(orderId, { from: user2 })
      console.log(`Filled final order from ${user1}`)

      await wait(1)
      // --------------------------------------------------------------------------

      // -------------------------- Seed Open Orders ----------------------------

      // User 1 and 2 make 10 orders each
      for (let i = 1; i <= 10; i++) {
         if (i % 2) {
            result = await exchange.makeOrder(token.address, tokens(8 + i), ETHER_ADDRESS, ether(0.001), { from: user1 })
            console.log(`Made buy order, total #${i} from ${user1}, price: ${ether(0.001) / tokens(8 + i)}`)
            await wait(1)
            result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.003), token.address, tokens(5 + i), { from: user2 })
            console.log(`Made sell order, total #${i} from ${user2}, price: ${ether(0.003) / tokens(5 + i)}`)
            await wait(1)
         } else {
            result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.005), token.address, tokens(8 + i), { from: user1 })
            console.log(`Made sell order, total #${i} from ${user1}, price: ${ether(0.005) / tokens(8 + i)}`)
            await wait(1)
            result = await exchange.makeOrder(token.address, tokens(6 + i), ETHER_ADDRESS, ether(0.001), { from: user2 })
            console.log(`Made buy order, total #${i} from ${user2}, price: ${ether(0.001) / tokens(6 + i)}`)
            await wait(1)
         }
      }
   } 
   catch(error) {
      console.log(error)
   }
   callback()
}