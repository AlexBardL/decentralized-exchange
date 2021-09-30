import { groupBy, reject, get, maxBy, minBy } from 'lodash'
import { ether, tokens, ETHER_ADDRESS, formatTimestamp, priceChartX, GREEN, RED } from '../../app/helpers'


// ------------------------ Formatting Filled Orders -----------------------------
export const formatFilledOrders = (filledOrders) => {
   let orders = [...filledOrders]
   // Sort orders' dates ascending, for price comparison
   orders.sort((a, b) => a.timestamp - b.timestamp)
   // Decorate the orders
   orders = decorateFilledOrders(orders)
   // Sort orders' dates descending, for display
   orders.sort((a, b) => b.timestamp - a.timestamp)
   return orders
}

const decorateFilledOrders = (orders) => {
   let previousOrder = orders[0]                   // Track previous order to compare history
   return(
      orders.map((order) => {
         order = decorateOrder(order)
         order = decorateFilledOrder(order, previousOrder)
         previousOrder = order
         return order
      })
   )
}

const decorateFilledOrder = (order, previousOrder) => {
   return({
      ...order,
      tokenPriceClass: tokenPriceClass(order, previousOrder)
   })
}

const tokenPriceClass = (order, previousOrder) => {
   // Show green price if only one order exists
   if(previousOrder.id === order.id) {
      return GREEN
   }
   // Show price in green if it is higher than previous order
   if(previousOrder.tokenPrice <= order.tokenPrice) {
      return GREEN
   } else {
      return RED
   }
}

// ------------------------ Formatting Order Book Orders -----------------------------
export const formatOrderBookOrders = ({ cancelledOrders, filledOrders, allOrders }) => {
   let openOrders = filterOpenOrders(cancelledOrders, filledOrders, allOrders)
   
   openOrders = decorateOrderBookOrders(openOrders)
   openOrders = groupBy(openOrders, 'orderType')
   if(openOrders.buy) {
      const buyOrders = openOrders.buy
      openOrders = {
         ...openOrders,
         buyOrders: buyOrders.sort((a, b) => a.tokenPrice - b.tokenPrice)
      }
   }
   if(openOrders.sell) {
      const sellOrders = openOrders.sell
      openOrders = {
         ...openOrders,
         sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
      }
   }
   return openOrders
}

const decorateOrderBookOrders = (orders) => {
   return(
      orders.map((order) => {
         order = decorateOrder(order)
         order = decorateOrderBookOrder(order)
         return order
      })
   )
}

const decorateOrderBookOrder = (order) => {
   const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
   return({
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? GREEN : RED),
      orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
   })
}

// --------------------- Formatting Customer's Filled Orders --------------------------
export const formatMyFilledOrders = ({ filledOrders, account }) => {   
   let orders = [...filledOrders]   
   orders = orders.filter((order) => order.user === account || order.userFill === account)
   orders.sort((a, b) => a.timestamp - b.timestamp)
   orders = decorateMyFilledOrders(orders, account)
   return orders
}

const decorateMyFilledOrders = (orders, account) => {
   return(
      orders.map((order) => {
         order = decorateOrder(order)
         order = decorateMyFilledOrder(order, account)
         return order
   })
   )
}

const decorateMyFilledOrder = (order, account) => {
   const myOrder = order.user === account
   let orderType
   if(myOrder) {
      orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
   } else {
      orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
   }
   
   return({
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? GREEN : RED),
      orderSign: (orderType === 'buy' ? '+' : '-')
   })
}

// --------------------- Formatting Customer's Open Orders --------------------------
export const formatMyOpenOrders = ({ cancelledOrders, filledOrders, allOrders, account }) => {
   let openOrders = filterOpenOrders(cancelledOrders, filledOrders, allOrders)

   openOrders = openOrders.filter((order) => order.user === account)
   openOrders = decorateMyOpenOrders(openOrders)
   openOrders.sort((a, b) => b.timestamp - a.timestamp)
   return openOrders
}

const decorateMyOpenOrders = (orders) => {
   return(
      orders.map((order) => {
         order = decorateOrder(order)
         order = decorateMyOpenOrder(order)
         return order
      })
      )
}

const decorateMyOpenOrder = (order) => {
   let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
   
   return({
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? GREEN : RED),
   })
}

// ------------------------ Building Price Chart -----------------------------
export const buildPriceChart = (filledOrders) => {
   let orders = [...filledOrders]
   
   orders.sort((a, b) => a.timestamp - b.timestamp)
   orders = orders.map((order) => decorateOrder(order))
   // Get last 2 orders for final price & price change
   let secondLastOrder, lastOrder
   [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
   const lastPrice = get(lastOrder, 'tokenPrice', 0)
   const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)
   
   return({
      lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
      series: [{
         data: buildGraphData(orders)
      }]
   })
}

const buildGraphData = (orders) => {
   orders = groupBy(orders, (order) => priceChartX(order.timestamp))
   // Get each hour where data exists
   const hours = Object.keys(orders)
   // Build the graph series
   const graphData = hours.map((hour) => {
      // Calculate price values - open, high, low, close
      const group = orders[hour]
      const open = group[0]
      const close = group[group.length - 1]
      const high = maxBy(group, 'tokenPrice')
      const low = minBy(group, 'tokenPrice')
      return({
         x: new Date(hour),
         y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
      })
   })
   return graphData
}

// -------------------------- Common functions -------------------------------
const decorateOrder = (order) => {
   let etherAmount
   let tokenAmount
   if(order.tokenGive === ETHER_ADDRESS) {
      etherAmount = order.amountGive
      tokenAmount = order.amountGet
   } else {
      etherAmount = order.amountGet
      tokenAmount = order.amountGive
   }
   // Calculate token price to 5 decimal places
   const precision = 100000
   let tokenPrice = (etherAmount / tokenAmount)
   tokenPrice = Math.round(tokenPrice * precision) / precision

   return({
      ...order,
      etherAmount: ether(etherAmount),
      tokenAmount: tokens(tokenAmount),
      tokenPrice,
      formattedTimestamp: formatTimestamp(order.timestamp)
   })
}

const filterOpenOrders = (cancelledOrders, filledOrders, allOrders) => {
   const openOrders = reject(allOrders, (order) => {
      const orderFilled = filledOrders.some((o) => o.id === order.id)
      const orderCancelled = cancelledOrders.some((o) => o.id === order.id)
      return(orderFilled || orderCancelled)
   })
   return openOrders
}