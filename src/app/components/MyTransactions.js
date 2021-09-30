import { Tabs, Tab} from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'

import { selectFilledOrdersLoaded, cancelOrder } from '../../features/orders/ordersSlice'
import { useMyOpenOrdersStatus, useInterfaceData } from '../../features/hooks'
import { formatMyFilledOrders, formatMyOpenOrders } from '../../features/orders/formattingOrders'
import { selectAccount } from '../../features/web3/web3Slice'

import Spinner from './Spinner'


const MyTransactions = () => {
   const dispatch = useDispatch()
   const filledOrdersReady = useSelector(selectFilledOrdersLoaded)
   const myOpenOrdersReady = useMyOpenOrdersStatus()
   const interfaceData = useInterfaceData()
   const account = useSelector(selectAccount)
   
   const showMyFilledOrders = () => {
      const myFilledOrders = formatMyFilledOrders(interfaceData)
      return(
         <tbody>
            { myFilledOrders.map((order) => {
               return(
                  <tr key={order.id}>
                     <td className='text-muted'>{order.formattedTimestamp}</td>
                     <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
                     <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                  </tr>
               )
            }) }
         </tbody>
      )
   }

   const showMyOpenOrders = () => {
      const myOpenOrders = formatMyOpenOrders(interfaceData)
      return(
         <tbody>
            { myOpenOrders.map((order) => {
               return(
                  <tr key={order.id}>
                     <td className={`ps-2 text-${order.orderTypeClass}`}>{order.tokenAmount}</td>
                     <td className={`ps-2 text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                     <td 
                        className='text-muted'
                        onClick={(e) => {
                           dispatch(cancelOrder(order))
                        }}
                     ><i className='bi bi-x-lg text-danger cancel-order ms-3 fw-bold'></i></td>
                  </tr>
               )
            }) }
         </tbody>
      )
   }


   return (
      <div className='card bg-dark text-white'>
         <div className='card-header'>
            My Transactions
         </div>
         <div className='card-body'>
            { 
               !account ?
                  <div className='d-flex justify-content-center mt-5'>
                     <span className='h5'>Please connect your Wallet</span>
                  </div>
               :
                  <Tabs defaultActiveKey='trades' className='bg-dark text-white'>
                     <Tab eventKey='trades' title='Trades' className='bg-dark'>
                        <table className='table table-dark table-sm small'>
                           <thead>
                              <tr>
                                 <th>Time</th>
                                 <th>DEX</th>
                                 <th>DEX/ETH</th>
                              </tr>
                           </thead>
                           { filledOrdersReady ? showMyFilledOrders() : <Spinner type='table' /> }
                        </table>
                     </Tab>
                     <Tab eventKey='orders' title='Orders'>
                        <table className='table table-dark table-sm small'>
                           <thead>
                              <tr>
                                 <th>Amount</th>
                                 <th>DEX/ETH</th>
                                 <th>Cancel</th>
                              </tr>
                           </thead>
                           { myOpenOrdersReady ? showMyOpenOrders() : <Spinner type='table' /> }
                        </table>
                     </Tab>
                  </Tabs>
            }
         </div>
      </div>
   )
}

export default MyTransactions
