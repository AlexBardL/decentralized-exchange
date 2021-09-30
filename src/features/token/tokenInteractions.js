import Token from '../../abis/Token.json'

import { tokenLoaded } from './tokenSlice'


export const loadToken = async (web3, networkId, dispatch) => {
   try{
      const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
      dispatch(tokenLoaded(token))
      return token
   } catch (err) {
      window.alert('Contract not deployed to the current network. Please select another network with Metamask.')
      console.log(err)
      return null
   }
}

export const faucet = async ({ account, token }) => {
   await token.methods.faucet().send({ from: account })
      .on('transactionHash', (hash) => { console.log(hash) })
      .on('error', (error) => {
         console.error(error)
         window.alert('There was an error!')
      })
}