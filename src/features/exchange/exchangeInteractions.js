import Exchange from '../../abis/Exchange.json'

import { exchangeLoaded } from './exchangeSlice'


export const loadExchange = async (web3, networkId, dispatch) => {
   try{
      const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
      dispatch(exchangeLoaded(exchange))
      return exchange
   } catch (err) {
      window.alert('Contract not deployed to the current network. Please select another network with Metamask.')
      console.log(err)
      return null
   }
}