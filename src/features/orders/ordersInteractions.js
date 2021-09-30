import { 
   cancelledOrdersLoaded, filledOrdersLoaded, allOrdersLoaded,
   orderCancelled, orderFilled, orderMade
} from './ordersSlice'
import { balancesLoaded, balancesLoading } from '../balances/balancesSlice'


// --------------------------- Fetching data from the blockchain ---------------------------
export const loadAllOrders = async (dispatch, exchange) => {
   // Fetch cancelled orders
   const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
   const cancelledOrders = cancelStream.map((event) => event.returnValues)
   if(cancelledOrders.length !== 0) {
      dispatch(cancelledOrdersLoaded(cancelledOrders))
   }
   
   // Fetch filled orders
   const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
   const filledOrders = tradeStream.map((event) => event.returnValues)
   if(filledOrders.length !== 0) {
      dispatch(filledOrdersLoaded(filledOrders))
   }
   
   // Fetch all orders
   const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
   const allOrders = orderStream.map((event) => event.returnValues)
   if(allOrders.length !== 0) {
      dispatch(allOrdersLoaded(allOrders))
   }
}

export const subscribeToEvents = async (dispatch, exchange) => {
   await exchange.events.Cancel({}, (error, event) => {
      dispatch(orderCancelled(event.returnValues))
   })
   await exchange.events.Trade({}, (error, event) => {
      dispatch(orderFilled(event.returnValues))
   })
   await exchange.events.Order({}, (error, event) => {
      dispatch(orderMade(event.returnValues))
   })
   await exchange.events.Deposit({}, (error, event) => {
      dispatch(balancesLoading())
      dispatch(balancesLoaded())
   })
   await exchange.events.Withdraw({}, (error, event) => {
      dispatch(balancesLoading())
      dispatch(balancesLoaded())
   })
}