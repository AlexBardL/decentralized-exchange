const EVM_REVERT = 'VM Exception while processing transaction: revert'
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

const ether = (n) => {
   return new web3.utils.BN(
      web3.utils.toWei(n.toString(), 'ether')
   )
}

const tokens = (n) => ether(n)

