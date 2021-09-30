import { useSelector } from 'react-redux'

import { selectFilledOrdersLoaded, selectFilledOrders } from '../../features/orders/ordersSlice'
import { formatFilledOrders } from '../../features/orders/formattingOrders'

import Spinner from './Spinner'


const Trades = () => {
   const filledOrdersReady = useSelector(selectFilledOrdersLoaded)
   const filledOrders = formatFilledOrders(useSelector(selectFilledOrders))
   
   const showFilledOrders = (filledOrders) => {
      return(
         <tbody>
            { filledOrders.map((order) => {
               return(
                  <tr className={`order-${order.id}`} key={order.id}>
                     <td className='text-muted'>{order.formattedTimestamp}</td>
                     <td>{order.tokenAmount}</td>
                     <td className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
                  </tr>
               )
            })}
         </tbody>
      )
   }

   return (
      <div className='vertical'>
         <div className='card bg-dark text-white'>
            <div className='card-header'>
               Trades
            </div>
            <div className='card-body'>
               <table className='table table-dark table-sm small'>
                  <thead>
                     <tr>
                        <th>Time</th>
                        <th>DEX</th>
                        <th>DEX/ETH</th>
                     </tr>
                  </thead>
                  { filledOrdersReady ? showFilledOrders(filledOrders) : <Spinner type='table' /> }
               </table>
            </div>
         </div>
      </div>
   )
}

export default Trades
