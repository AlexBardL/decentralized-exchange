import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useInterfaceData, useOrderBookStatus } from '../../features/hooks'
import { loadBalances } from '../../features/balances/balancesInteractions'
import { selectBalancesLoading } from '../../features/balances/balancesSlice'
import { selectAccount } from '../../features/web3/web3Slice'

import Spinner from './Spinner'
import BalanceForm from './BalanceForm'


const Balance = () => {
   const dispatch = useDispatch()
   const interfaceData = useInterfaceData()
   const ordersLoaded = useOrderBookStatus()
   const balancesLoading = useSelector(selectBalancesLoading)
   const account = useSelector(selectAccount)
   
   useEffect(() => {
      const init = async () => {
         if(ordersLoaded && account) {
            await loadBalances(dispatch, interfaceData)
         }
      }
      init()
	}, [dispatch, interfaceData, ordersLoaded, account])

   
   return (
      <div className='card bg-dark text-white'>
            <div className='card-header'>
               Balance
            </div>
            <div className='card-body'>
               { 
                  !account ?
                     <div className='d-flex justify-content-center mt-5'>
                        <span className='h5'>Please connect your Wallet</span>
                     </div>
                  :
                     !balancesLoading ? <BalanceForm /> : <Spinner /> 
               }
            </div>
         </div>
   )
}

export default Balance
