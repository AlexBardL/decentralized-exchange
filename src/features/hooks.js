import { useSelector } from 'react-redux'

import {
   selectCancelledOrdersLoaded, selectFilledOrdersLoaded, selectAllOrdersLoaded,
   selectCancelledOrders, selectFilledOrders, selectAllOrders, 
   selectOrderCancelling, selectOrderFilling
} from './orders/ordersSlice'
import { selectExchange } from './exchange/exchangeSlice'
import { selectToken } from './token/tokenSlice'
import { selectWeb3, selectAccount } from './web3/web3Slice'


const useOpenOrdersStatus = () => {
   const cancelledOrdersLoaded = useSelector(selectCancelledOrdersLoaded)
   const filledOrdersLoaded = useSelector(selectFilledOrdersLoaded)
   const allOrdersLoaded = useSelector(selectAllOrdersLoaded)
   return ( cancelledOrdersLoaded && filledOrdersLoaded && allOrdersLoaded )
}

export const useOrderBookStatus = () => {
   const openBookReady = useOpenOrdersStatus()
   const orderFilling = useSelector(selectOrderFilling)
   return ( openBookReady && !orderFilling )
}

export const useMyOpenOrdersStatus = () => {
   const openBookReady = useOpenOrdersStatus()
   const orderCancelling = useSelector(selectOrderCancelling)
   return ( openBookReady && !orderCancelling )
}

export const useInterfaceData = () => {
   const cancelledOrders = useSelector(selectCancelledOrders)
   const filledOrders = useSelector(selectFilledOrders)
   const allOrders = useSelector(selectAllOrders)
   
   const exchange = useSelector(selectExchange)
   const token = useSelector(selectToken)
   const web3 = useSelector(selectWeb3)
   const account = useSelector(selectAccount)
   
   return {
      cancelledOrders,
      filledOrders,
      allOrders,
      exchange,
      token,
      web3,
      account
   }
}