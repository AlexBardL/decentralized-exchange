import { ETHER_ADDRESS } from '../../app/helpers'
import { 
   customerEtherBalanceLoaded, customerTokenBalanceLoaded,
   exchangeEtherBalanceLoaded, exchangeTokenBalanceLoaded,
   balancesLoaded
} from './balancesSlice'


export const loadBalances = async (dispatch, { web3, exchange, token, account }) => {
   if(typeof account !== 'undefined') {
      // Ether balance in wallet
      const etherBalance = await web3.eth.getBalance(account)
      dispatch(customerEtherBalanceLoaded(etherBalance))

      // Token balance in wallet
      const tokenBalance = await token.methods.balanceOf(account).call()
      dispatch(customerTokenBalanceLoaded(tokenBalance))

      // Ether balance in exchange
      const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
      dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))

      // Token balance in exchange
      const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
      dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))

      // Trigger all balances loaded
      dispatch(balancesLoaded())
   } else {
      window.alert('Please login with Metamask')
   }
}