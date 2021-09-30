const Token = artifacts.require('./Token')

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


contract('Token', ([deployer, receiver, exchange, tester]) => {
   const name = 'DEX Token'
   const symbol = 'DEX'
   const decimals = '18'
   const totalSupply = tokens(1000000).toString()
   const halfOfTS = tokens(1000000 / 2).toString()
   
   let token

   beforeEach(async () => {
      // Fetch token from blockchain
      token = await Token.new()         
   })

   describe('deployment', () => {
      it('tracks the name', async () => {
         const result = await token.name()
         result.should.equal(name)                 
      })

      it('tracks the symbol', async () => {
         const result = await token.symbol()
         result.should.equal(symbol)
      })
      
      it('tracks the decimals', async () => {
         const result = await token.decimals()
         result.toString().should.equal(decimals)
      })
      
      it('tracks the total supply', async () => {
         const result = await token.totalSupply()
         result.toString().should.equal(totalSupply)
      })

      it('assigns half of the total supply to the deployer', async () => {
         const result = await token.balanceOf(deployer)
         result.toString().should.equal(halfOfTS)
      })
   })

   describe('sending tokens', () => {
      let result
      let amount

      describe('success', () => {
         beforeEach(async () => {
            amount = tokens(100)
            result = await token.transfer(receiver, amount, { from: deployer })
         })
         
         it('transfers token balances', async () => {
            let balanceOf
            // After transfer
            balanceOf = await token.balanceOf(deployer)
            balanceOf.toString().should.equal(tokens(499900).toString())
            balanceOf = await token.balanceOf(receiver)
            balanceOf.toString().should.equal(tokens(100).toString())
         })
   
         it('emits a Transfer event', () => {
            const log = result.logs[0]
            log.event.should.equal('Transfer')
            const event = log.args
            event.from.toString().should.equal(deployer, 'from is correct')
            event.to.should.equal(receiver, 'to is correct')
            event.value.toString().should.equal(amount.toString(), 'value is correct')
         })
      })

      describe('failure', () => {
         it('rejects insufficient balances', async () => {
            let invalidAmount
            invalidAmount = tokens(100000000)        // 100 millions
            await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT)
            
            invalidAmount = tokens(10)
            await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejectedWith(EVM_REVERT)
         })

         it('rejects invalid recipients', () => {
            token.transfer(0x0, amount, { from: deployer }).should.be.rejected
         })
      })
   })

   describe('approving tokens', () => {
      let result
      let amount

      beforeEach(async () => {
         amount = tokens(100)
         result = await token.approve(exchange, amount, { from: deployer })
      })

      describe('success', () => {
         it('allocates an allowance for delegated token spending on exchange', async () => {
            const allowance = await token.allowance(deployer, exchange)
            allowance.toString().should.equal(amount.toString())
         })

         it('emits an Approval event', () => {
            const log = result.logs[0]
            log.event.should.equal('Approval')
            const event = log.args
            event.owner.toString().should.equal(deployer, 'owner is correct')
            event.spender.should.equal(exchange, 'spender is correct')
            event.value.toString().should.equal(amount.toString(), 'value is correct')
         })
      })

      describe('failure', () => {
         it('rejects invalid spenders', () => {
            token.approve(0x0, amount, { from: deployer }).should.be.rejected
         })
      })
   })

   describe('delegated token transfers', () => {
      let result
      let amount

      beforeEach(async () => {
         amount = tokens(100)
         await token.approve(exchange, amount, { from: deployer })
      })

      describe('success', () => {
         beforeEach(async () => {
            result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
         })
         
         it('transfers token balances', async () => {
            let balanceOf
            // After transfer
            balanceOf = await token.balanceOf(deployer)
            balanceOf.toString().should.equal(tokens(499900).toString())
            balanceOf = await token.balanceOf(receiver)
            balanceOf.toString().should.equal(tokens(100).toString())
         })
   
         it('resets the allowance', async () => {
            const allowance = await token.allowance(deployer, exchange)
            allowance.toString().should.equal('0')
         })

         it('emits a Transfer event', () => {
            const log = result.logs[0]
            log.event.should.equal('Transfer')
            const event = log.args
            event.from.toString().should.equal(deployer, 'from is correct')
            event.to.should.equal(receiver, 'to is correct')
            event.value.toString().should.equal(amount.toString(), 'value is correct')
         })
      })

      describe('failure', () => {
         it('rejects insufficient amounts', () => {
            // Attempt to transfer too many tokens
            const invalidAmount = tokens(100000000)
            token.transferFrom(deployer, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT)            
         })

         it('rejects invalid recipients', () => {
            token.transferFrom(deployer, 0x0, amount, { from: exchange }).should.be.rejected
         })
      })
   })

   describe('faucet functionality', () => {
      it('contract transfers 500 DEX', async () => {
         const balanceBefore = await token.balanceOf(tester)
         balanceBefore.toString().should.equal('0', 'initial balance is correct')
         await token.faucet({ from: tester })
         const balanceAfter = await token.balanceOf(tester)
         balanceDif = balanceAfter - balanceBefore
         balanceDif.toString().should.equal(tokens(500).toString(), 'issued 500 DEX correctly')
      })
      
      it('rejects faucet request if address has >= 100 DEX', async () => {
         const balanceBefore = await token.balanceOf(tester)
         balanceBefore.toString().should.equal('0', 'initial balance is correct')
         await token.faucet({ from: tester })
         const balanceAfter = await token.balanceOf(tester)
         balanceDif = balanceAfter - balanceBefore
         balanceDif.toString().should.equal(tokens(500).toString(), 'issued 500 DEX correctly')
         await token.transfer(receiver, tokens(400), { from: tester })
         const finalBalance = await token.balanceOf(tester)
         finalBalance.toString().should.equal(tokens(100).toString(), 'tester has 100 DEX')
         await token.faucet({ from: tester }).should.be.rejectedWith(EVM_REVERT)
      })

      it('faucet works for admin even when >= 100 DEX', async () => {
         const balanceBefore = await token.balanceOf(deployer)
         balanceBefore.toString().should.equal(tokens(500000).toString(), 'initial balance is correct')
         await token.faucet({ from: deployer })
         const balanceAfter = await token.balanceOf(deployer)
         balanceAfter.toString().should.equal(tokens(500500).toString(), 'final balance is correct')
      })
   })     
})