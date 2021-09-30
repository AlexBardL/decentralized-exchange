import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectExchange } from '../../features/exchange/exchangeSlice'
import { loadAllOrders, subscribeToEvents } from '../../features/orders/ordersInteractions'

import Balance from './Balance'
import NewOrder from './NewOrder'
import OrderBook from './OrderBook'
import PriceChart from './PriceChart'
import MyTransactions from './MyTransactions'
import Trades from './Trades'


const Content = () => {
   const dispatch = useDispatch()
   const exchange = useSelector(selectExchange)
  
   useEffect(() => {
      const init = async () => {
         await loadAllOrders(dispatch, exchange)
         await subscribeToEvents(dispatch, exchange)
      }
      init()
	}, [dispatch, exchange])


   return (
      <div className='content'>
         <div className='vertical-split'>
            <Balance />
            <NewOrder />
         </div>

         <OrderBook />
         
         <div className='vertical-split'>
            <PriceChart />
            <MyTransactions />
         </div>

         <Trades />
      </div>
   )
}

export default Content
