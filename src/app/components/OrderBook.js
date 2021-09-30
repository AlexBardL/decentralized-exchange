import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useDispatch } from 'react-redux'

import { fillOrder } from '../../features/orders/ordersSlice'
import { useOrderBookStatus, useInterfaceData } from '../../features/hooks'
import { formatOrderBookOrders } from '../../features/orders/formattingOrders'

import Spinner from './Spinner'


const OrderBook = () => {
   const dispatch = useDispatch()
   const orderBookReady = useOrderBookStatus()
   const interfaceData = useInterfaceData()
   
   const renderOrder = (order) => {
      return(
         <OverlayTrigger
            key={order.id}
            placement='top'
            overlay={
               <Tooltip id={order.id}>
                  {`Click here to ${order.orderFillAction}`}
               </Tooltip>
            }
         >
            <tr 
               key={order.id}
               className='order-book-order'
               onClick={(e) => dispatch(fillOrder(order))}
            >
               <td>{order.tokenAmount}</td>
               <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
               <td>{order.etherAmount}</td>
            </tr>
         </OverlayTrigger>
      )
   }
   
   const showOrderBook = () => {
      const orderBookOrders = formatOrderBookOrders(interfaceData)
      
      return(
         <tbody>
            { orderBookOrders.sellOrders && orderBookOrders.sellOrders.map((order) => renderOrder(order)) }
            <tr>
               <th>DEX</th>
               <th>DEX/ETH</th>
               <th>ETH</th>
            </tr>
            { orderBookOrders.buyOrders && orderBookOrders.buyOrders.map((order) => renderOrder(order)) }
         </tbody>
      )
   }


   return (
      <div className='vertical'>
         <div className='card bg-dark text-white'>
            <div className='card-header'>
               Order Book
            </div>
            <div className='card-body order-book'>
               <table className='table table-dark table-sm small'>
                  { orderBookReady ? showOrderBook() : <Spinner type='table' /> }
               </table>
            </div>
         </div>
      </div>
   )
}

export default OrderBook
