const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')

require('chai')
   .use(require('chai-as-promised'))
   .should()

const EVM_REVERT = 'VM Exception while processing transaction: revert'
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

const ether = (n) => {
   return new web3.utils.BN(
      web3.utils.toWei(n.toString(), 'ether')
   )
}

const tokens = (n) => ether(n)  


contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
   let token
   let exchange
   const feeRate = 10

   beforeEach(async () => {
      token = await Token.new()
      token.transfer(user1, tokens(100), { from: deployer })
      
      exchange = await Exchange.new(feeAccount, feeRate)
   })

   describe('deployment', () => {
      it('tracks the fee account', async () => {
         const result = await exchange.feeAccount()
         result.should.equal(feeAccount)
      })

      it('tracks the fee rate', async () => {
         const result = await exchange.feeRate()
         result.toString().should.equal(feeRate.toString())
      })
   })

   describe('fallback', () => {
      it('reverts when Ether sent directly to the Exchange address', async () => {
         await exchange.sendTransaction({ value: ether(1), from: user1 }).should.be.rejectedWith(EVM_REVERT)
      })
   })

   describe('depositing Ether', async () => {
      let amount
      let result

      beforeEach(async () => {
         amount = ether(1)
         result = await exchange.depositEther({ from: user1, value: amount })
      })

      it('tracks the Ether deposit', async () => {
         const balance = await exchange.tokens(ETHER_ADDRESS, user1)
         balance.toString().should.equal(amount.toString())
      })

      it('emits a Deposit event', () => {
         const log = result.logs[0]
         log.event.should.equal('Deposit')
         const event = log.args
         event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
         event.user.should.equal(user1, 'user address is correct')
         event.amount.toString().should.equal(amount.toString(), 'amount is correct')
         event.balance.toString().should.equal(amount.toString(), 'balance is correct')
      })
   })

   describe('withdrawing Ether', async () => {
      let amount
      let result

      beforeEach(async () => {
         amount = ether(1)
         await exchange.depositEther({ from: user1, value: amount })
      })

      describe('success', () => {
         beforeEach(async () => {
            result = await exchange.withdrawEther(amount, { from: user1 })
         })

         it('withdraws Ether funds', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.equal('0')
         })

         it('emits a Withdraw event', () => {
            const log = result.logs[0]
            log.event.should.equal('Withdraw')
            const event = log.args
            event.token.should.equal(ETHER_ADDRESS)
            event.user.should.equal(user1)
            event.amount.toString().should.equal(amount.toString())
            event.balance.toString().should.equal('0')
         })
      })

      describe('failure', () => {
         it('rejects withdraws for insufficient balances', async () => {
            await exchange.withdrawEther(ether(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
         })
      })
      
   })

   describe('depositing tokens', () => {
      let amount = tokens(10)
      let result

      describe('success', () => {
         beforeEach(async () => {
            await token.approve(exchange.address, amount, { from: user1 })
            result = await exchange.depositToken(token.address, amount, { from: user1 })
         })

         it('tracks the token deposit', async () => {
            let balance
            balance = await token.balanceOf(exchange.address)
            balance.toString().should.equal(amount.toString())

            balance = await exchange.tokens(token.address, user1)
            balance.toString().should.equal(amount.toString())
         })

         it('emits a Deposit event', () => {
            const log = result.logs[0]
            log.event.should.equal('Deposit')
            const event = log.args
            event.token.should.equal(token.address, 'token address is correct')
            event.user.should.equal(user1, 'user address is correct')
            event.amount.toString().should.equal(amount.toString(), 'amount is correct')
            event.balance.toString().should.equal(amount.toString(), 'balance is correct')
         })
      })

      describe('failure', () => {
         it('rejects Ether deposits', async () => {
            await exchange.depositToken(ETHER_ADDRESS, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
         })
         
         it('fails when no tokens are approved', async () => {
            await exchange.depositToken(token.address, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
         })
      })
   })

   describe('withdrawing tokens', () => {
      let amount = tokens(10)
      let result

      describe('success', () => {
         beforeEach(async () => {
            // Deposit tokens first
            await token.approve(exchange.address, amount, { from: user1 })
            await exchange.depositToken(token.address, amount, { from: user1 })

            result = await exchange.withdrawToken(token.address, amount, { from: user1 })
         })

         it('withdraws token funds', async () => {
            const balance = await exchange.tokens(token.address, user1)
            balance.toString().should.equal('0')
         })

         it('emits a Withdraw event', () => {
            const log = result.logs[0]
            log.event.should.equal('Withdraw')
            const event = log.args
            event.token.should.equal(token.address)
            event.user.should.equal(user1)
            event.amount.toString().should.equal(amount.toString())
            event.balance.toString().should.equal('0')
         })
      })

      describe('failure', () => {
         it('rejects Ether withdrawals', async () => {
            await exchange.depositEther({ from: user1, value: ether(1) })
            const balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.equal(ether(1).toString())
            await exchange.withdrawToken(ETHER_ADDRESS, ether(1), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
         })

         it('fails for insufficient balances', async () => {
            // Attempt to withdraw tokens without depositing any
            await exchange.withdrawToken(token.address, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
         })
      })
   })

   describe('checking balances', () => {
      beforeEach(async () => {
         await exchange.depositEther({ from:user1, value: ether(1) })
      })

      it('returns user balance', async () => {
         const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
         result.toString().should.equal(ether(1).toString())
      })
   })
   
   describe('making orders', () => {
      let result

      beforeEach(async () => {
         result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
      })

      it('tracks the newly created order', async () => {
         const orderCount = await exchange.orderCount()
         orderCount.toString().should.equal('1')
         const order = await exchange.orders('1')
         order.id.toString().should.equal('1', 'id is correct')
         order.user.should.equal(user1, 'user is correct')
         order.tokenGet.should.equal(token.address, 'tokenGet is correct')
         order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
         order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
         order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
         order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
      })

      it('emits an Order event', () => {
         const log = result.logs[0]
         log.event.should.equal('Order')
         const event = log.args
         event.id.toString().should.equal('1', 'id is correct')
         event.user.should.equal(user1, 'user is correct')
         event.tokenGet.should.equal(token.address, 'tokenGet is correct')
         event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
         event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
         event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
         event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
      })
   })
   
   describe('order actions', () => {
      beforeEach(async () => {
         // user1 deposits 1 ether
         await exchange.depositEther({ from: user1, value: ether(1) })
         // user2 owns tokens
         await token.transfer(user2, tokens(10), { from: deployer })
         // user2 deposits tokens
         await token.approve(exchange.address, tokens(2), { from: user2 })
         await exchange.depositToken(token.address, tokens(2), { from: user2 })
         // user1 makes an order to buy tokens with Ether
         await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
      })

      describe('filling orders', () => {
         let result

         describe('success', () => {
            beforeEach(async () => {
               // user2 fills order #1
               result = await exchange.fillOrder(1, { from: user2 })
            })

            it('executes the trade & charges fees', async () => {
               let balance
               balance = await exchange.balanceOf(token.address, user1)
               balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens')
               balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
               balance.toString().should.equal(ether(1).toString(), 'user2 received Ether')
               balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
               balance.toString().should.equal('0', 'user1 Ether deducted')
               balance = await exchange.balanceOf(token.address, user2)
               balance.toString().should.equal(tokens(0.9).toString(), 'user2 tokens deducted with fee applied')
               const feeAccount = await exchange.feeAccount()
               balance = await exchange.balanceOf(token.address, feeAccount)
               balance.toString().should.equal(tokens(0.1).toString(), 'feeAccount received fee')
            })

            it('updates filled orders', async () => {
               const orderFilled = await exchange.ordersFilled(1)
               orderFilled.should.equal(true)
            })

            it('emits a Trade event', () => {
               const log = result.logs[0]
               log.event.should.equal('Trade')
               const event = log.args
               event.id.toString().should.equal('1', 'id is correct')
               event.user.should.equal(user1, 'user is correct')
               event.tokenGet.should.equal(token.address, 'tokenGet is correct')
               event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
               event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
               event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
               event.userFill.should.equal(user2, 'userFill is correct')
               event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
            })
         })   
         
         describe('failure', () => {
            it('rejects invalid order ids', async () => {
               const invalidOrderId = 99999
               await exchange.fillOrder(invalidOrderId, { from: user2 }).should.be.rejectedWith(EVM_REVERT)
            })
            
            it('rejects already filled orders', async () => {
               // fill the order
               await exchange.fillOrder(1, { from: user2 }).should.be.fulfilled
               // Try to fill it again
               await exchange.fillOrder(1, { from: user2 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects cancelled orders', async () => {
               // Cancel the order
               await exchange.cancelOrder(1, { from: user1 }).should.be.fulfilled
               // Try to fill cancelled order
               await exchange.fillOrder(1, { from:user2 }).should.be.rejectedWith(EVM_REVERT)
            })
         })
      })

      describe('cancelling orders', () => {
         let result
         
         describe('success', () => {
            beforeEach(async () => {
               result = await exchange.cancelOrder(1, { from: user1 })
            })

            it('updates cancelled orders', async () => {
               const orderCancelled = await exchange.ordersCancelled(1)
               orderCancelled.should.equal(true)
            })

            it('emits a Cancel event', () => {
               const log = result.logs[0]
               log.event.should.equal('Cancel')
               const event = log.args
               event.id.toString().should.equal('1', 'id is correct')
               event.user.should.equal(user1, 'user is correct')
               event.tokenGet.should.equal(token.address, 'tokenGet is correct')
               event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
               event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
               event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
               event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
            })
         })

         describe('failure', () => {
            it('rejects invalid order ids', async () => {
               const invalidOrderId = 99999
               await exchange.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects unauthorized cancellation', async () => {
               await exchange.cancelOrder(1, { from: user2 }).should.be.rejectedWith(EVM_REVERT)
            })
         })
      })
   })
})