import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'

import { web3Loaded, accountLoaded } from './web3Slice'


export const loadWeb3 = async (dispatch) => {
   const provider = await detectEthereumProvider()
   if(provider) {
      if (provider !== window.ethereum) {
         window.alert('Do you have multiple wallets installed?')
      }
      provider.on('chainChanged', () => { window.location.reload() })
      const web3 = new Web3(window.ethereum)
      dispatch(web3Loaded(web3))
      return web3
   } 
   else {
      window.alert('Please install Metamask')
      window.location.assign("https://metamask.io/")
      return null
   }
}

export const loadAccount = async (dispatch, web3, account) => {
   const handleAccountsChanged = (accounts) => {
      accounts = accounts.map(account => web3.utils.toChecksumAddress(account))
      if (accounts.length === 0) {
         // MetaMask is locked or the user has not connected any accounts
         window.alert('Please connect to MetaMask')
      } 
      else if (accounts[0] !== account) {
         dispatch(accountLoaded(accounts[0]))
      }
   }
   
   await window.ethereum.on('accountsChanged', handleAccountsChanged)  
}  
   
export const connectAccount = async (dispatch, { web3 }) => {
   try {
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      accounts = accounts.map(account => web3.utils.toChecksumAddress(account))
      if (accounts.length === 0) {
         // MetaMask is locked or the user has not connected any accounts
         window.alert('Please connect to MetaMask')
      } 
      else {
         dispatch(accountLoaded(accounts[0]))
      }
      return accounts[0]
   }
   catch(err) {
      if (err.code === 4001) {
         // EIP-1193 userRejectedRequest error
         // If this happens, the user rejected the connection request.
         window.alert('You refused to connect Metamask');
      } else {
         console.error(err);
      }
      return null
   }
}