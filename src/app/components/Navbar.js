import { useDispatch, useSelector } from 'react-redux'

import { selectAccount } from '../../features/web3/web3Slice'
import { connectAccount } from '../../features/web3/web3Interactions'
import { faucet } from '../../features/token/tokenInteractions'
import { loadBalances } from '../../features/balances/balancesInteractions'
import { useInterfaceData } from '../../features/hooks'


const Navbar = () => {
   const dispatch = useDispatch()
   let account = useSelector(selectAccount)
   const interfaceData = useInterfaceData()
   
   const connect = async () => {
      account = await connectAccount(dispatch, interfaceData)
   }

   const requestFaucet = async () => {
      await faucet(interfaceData)
      await loadBalances(dispatch, interfaceData)
   }


   return (
      <nav className='navbar navbar-expand-lg navbar-dark bg-dark bg-gradient'>
         <div className='container-fluid'>
            <a className='navbar-brand fw-bold' href='/#'>Decentralized Exchange</a>
            <div className='d-flex gap-2 col-6 justify-content-end'>
               <button className='btn btn-primary mx-2' disabled={!account} onClick={requestFaucet}>
                  Request DEX Token
               </button>
               { 
                  (account) ? 
                     <a 
                        className='btn btn-primary col-4'
                        href={`https://ropsten.etherscan.io/address/${account}`}
                        target='_blank'
                        rel='noopener noreferrer'
                     >
                        {`${account.slice(0,6)}.....${account.slice(-4)}`}
                     </a>         
                  :
                     <a 
                        className='btn btn-primary col-4'
                        href='/#'
                        onClick={connect}
                     >
                        Connect a Wallet
                     </a>
               }
            </div>
         </div>
      </nav>
   )
}

export default Navbar
